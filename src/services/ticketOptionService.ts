import { Types } from "mongoose";
import { ITicketOptionSchema, TicketOption } from "../models/ticketOptions";
import {
  ITicketOptionDto,
  ITicketOptionUpdateDto,
} from "../types/ticketOption";
import { Ticket } from "../models/tickets";
import { findEventById } from "./eventsService";
import { IEvent } from "../models/events";

export async function getTicketOptionsOfEvent(
  eventId: Types.ObjectId | string
) {
  return await TicketOption.find({ event: eventId }).exec();
}

export async function findTicketOption(id: Types.ObjectId | string) {
  return await TicketOption.findById(id).exec();
}

export async function createTicketOption(
  data: ITicketOptionDto & { stripeProductId: string }
) {
  const tOpt = new TicketOption(data);
  const event = await findEventById(data.event);
  await tOpt.save();
  event?.ticketOptions.push(tOpt._id);
  await event?.save();
  return tOpt;
}

export async function updateTicketOption(
  id: Types.ObjectId | string,
  data: ITicketOptionUpdateDto
) {
  return await TicketOption.findByIdAndUpdate(id, data).exec();
}

export async function deleteTicketOptionById(id: Types.ObjectId | string) {
  const tOpt = await TicketOption.findById(id).populate("event").exec();
  const event = tOpt?.event as unknown as IEvent;
  event.ticketOptions = event.ticketOptions.filter((val) => val !== tOpt?._id);
  await event.save();
  await tOpt?.deleteOne();
}
