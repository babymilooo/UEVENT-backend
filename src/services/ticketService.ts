import { Types } from "mongoose";
import { ITicket, Ticket } from "../models/tickets";
import { findEventById } from "./eventsService";
import { findUserByEmail } from "./userService";

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
  eventId: string | Types.ObjectId,
  ownerEmail: string,
  ownerName: string
): Promise<ITicket> {
  const event = await findEventById(eventId);
  if (!event) throw new Error("Event not found");
  const user = await findUserByEmail(ownerEmail);

  if (user) {
    const newTicket = new Ticket({
      event: event._id,
      owner: user._id,
      ownerEmail,
      ownerName,
      price: event.price,
      category: "Ticket",
      isUsed: false,
    });
    await newTicket.save();
    return newTicket;
  } else {
    const newTicket = new Ticket({
      event: event._id,
      ownerEmail,
      ownerName,
      price: event.price,
      category: "Ticket",
      isUsed: false,
    });
    await newTicket.save();
    return newTicket;
  }
}
