import { Request, Response } from "express";
import { errorMessageObj } from "../helpers/errorMessageObj";
import { findUserByEmail } from "../services/userService";
import { findEventById } from "../services/eventsService";
import { Ticket } from "../models/tickets";
import { ITicketCreateDto } from "../types/ticket";
import { deleteTicketById } from "../services/ticketService";

export async function createTicketController(req: Request, res: Response) {
  try {
    const { eventId, ownerEmail, ownerName } = req.body as ITicketCreateDto;
    if (!eventId || !ownerEmail || !ownerName) return res.status(400).json(errorMessageObj('eventId, ownerEmail and ownerName are required'));
    const registeredUser = await findUserByEmail(ownerEmail.trim());
    const event = await findEventById(eventId);
    if (!event) return res.status(404).json(errorMessageObj('Event not found'));
    try {
      if (registeredUser) {
        const ticket = new Ticket({
          event: event._id,
          owner: registeredUser._id,
          ownerEmail: ownerEmail.trim(),
          ownerName,
          price: event.price,
          category: 'Ticket',
          isUsed: false,
        });
        await ticket.save();
        return res.json(ticket.toObject());
      }
      else {
        const ticket = new Ticket({
          event: event._id,
          ownerEmail: ownerEmail.trim(),
          ownerName,
          price: event.price,
          category: 'Ticket',
          isUsed: false,
        });
        await ticket.save();
        return res.json(ticket.toObject());
      }
    } catch (error) {
      console.error(error);
      return res.status(400).json(errorMessageObj('Wrong email format'));
    }
    
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorMessageObj('Server Error'));
  }
}

export async function deleteTicketController(req: Request, res: Response) {
  try {
    const { ticketId } = req.params;
    await deleteTicketById(ticketId);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(404).json(errorMessageObj('Ticket not found'));
  }
  
}
