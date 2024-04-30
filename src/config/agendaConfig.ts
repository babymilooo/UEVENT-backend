import { Agenda } from "@hokify/agenda";
import { Event } from "../models/events";
import { ITicket, Ticket } from "../models/tickets";
import { GMAIL_USERNAME, eventReminderEmail } from "./emailConfig";
import { sendMail } from "../services/emailService";

const MONGODB_URI = process.env.MONGODB_URI || "";

export const agenda = new Agenda({ db: { address: MONGODB_URI } });

agenda.define("send event reminder", async (job) => {
  const now = new Date();
  const dayBefore = new Date(now.getTime() - 1000 * 60 * 60 * 24);
  const events = await Event.find({
    isOver: false,
    reminderSent: false,
    date: {
      $gte: dayBefore,
      $lt: now,
    },
  }).exec();
  const eventIds = events.map((e) => e._id);
  const tickets = await Ticket.find({ isUsed: false, event: { $in: eventIds } })
    .populate("event")
    .exec();

  const groupedTickets = tickets.reduce((groups: any, ticket) => {
    const eventId = ticket.event._id.toString(); // Get the eventId as a string
    groups[eventId] = groups[eventId] || [];
    groups[eventId].push(ticket);
    return groups;
  }, {});
  console.log(groupedTickets);
  
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
});
