import { Agenda } from "@hokify/agenda";
import { Event } from "../models/events";
import { ITicket, Ticket } from "../models/tickets";
import { GMAIL_USERNAME, eventReminderEmail } from "./emailConfig";
import { sendMail } from "../services/emailService";

const MONGODB_URI = process.env.MONGODB_URI || "";

export const agenda = new Agenda({ db: { address: MONGODB_URI } });

export const sendEventReminderJob = async () => {
  // console.log('job');
  
  const now = new Date();
  const dayTomorrow = new Date(now.getTime() + 1000 * 60 * 60 * 24);
  // console.log(dayTomorrow);
  
  const events = await Event.find({
    reminderSent: false,
    date: {
      $gte: now,
      $lt: dayTomorrow,
    },
  }).exec();
  // console.log(events);
  
  const eventIds = events.map((e) => e._id.toString());
  // console.log(eventIds);
  
  const tickets = await Ticket.find({ isUsed: false, event: { $in: eventIds } })
    .populate("event")
    .exec();
  // console.log(tickets);
  
  const groupedTickets = tickets.reduce((groups: any, ticket) => {
    const eventId = ticket.event._id.toString(); // Get the eventId as a string
    groups[eventId] = groups[eventId] || [];
    groups[eventId].push(ticket);
    return groups;
  }, {});
  // console.log(groupedTickets);
  
  for (const eventId in groupedTickets) {
    if (Object.prototype.hasOwnProperty.call(groupedTickets, eventId)) {
      const ticketGroup: ITicket[] = groupedTickets[eventId];
      const emails = ticketGroup.map((t) => t.ownerEmail);
      const ev = await Event.findById(eventId).exec();
      if (!ev) continue;
      const emailHtml = eventReminderEmail(ev);
      sendMail({
        subject: "Event reminder",
        bcc: emails,
        from: GMAIL_USERNAME,
        html: emailHtml,
      }).then(() => {
        ev.reminderSent = true;
        ev.save();
      });
    }
  }
}

agenda.define("send event reminder", sendEventReminderJob);
