import { Types } from "mongoose";
import { ITicket, Ticket } from "../models/tickets";
import { findEventById } from "./eventsService";
import { findUserByEmail } from "./userService";
import { findTicketOption } from "./ticketOptionService";

export async function deleteTicketById(id:string | Types.ObjectId) {
  return await Ticket.findByIdAndDelete(id);
}

export async function findTicketById(id: string | Types.ObjectId) {
  return await Ticket.findById(id).exec();
}

export async function findTicketsByOwnerId(userId: string | Types.ObjectId) {
  return await Ticket.find({ owner: userId }).exec();
}

export async function findTicketsByOwnerEmail(email: string) {
  return await Ticket.find({ ownerEmail: email }).exec();
}

export async function findTicketsByOwnerEmailAndEventId(
  email: string,
  eventId: string | Types.ObjectId
) {
  return await Ticket.find({ ownerEmail: email, event: eventId }).exec();
}

export async function createNewTicket(
  ticketOptionId: string | Types.ObjectId,
  ownerEmail: string,
  ownerName: string
): Promise<ITicket> {
  const ticketOption = await findTicketOption(ticketOptionId);
  if (!ticketOption) throw new Error("TicketOption not found");
  const event = await findEventById(ticketOption.event);
  if (!event) throw new Error("Event not found");
  const user = await findUserByEmail(ownerEmail);

  if (user) {
    const newTicket = new Ticket({
      event: event._id,
      owner: user._id,
      ticketOption: ticketOption._id,
      ownerEmail,
      ownerName,
      price: ticketOption.price,
      category: "Ticket",
      isUsed: false,
    });
    await newTicket.save();
    return newTicket;
  } else {
    const newTicket = new Ticket({
      event: event._id,
      ticketOption: ticketOption._id,
      ownerEmail,
      ownerName,
      price: ticketOption.price,
      category: "Ticket",
      isUsed: false,
    });
    await newTicket.save();
    return newTicket;
  }
}
