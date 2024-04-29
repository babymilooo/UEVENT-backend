import { Request, Response } from "express";
import { errorMessageObj } from "../helpers/errorMessageObj";
import { findUserByEmail } from "../services/userService";
import { findEventById } from "../services/eventsService";
import { Ticket } from "../models/tickets";
import { ITicketCreateDto } from "../types/ticket";
import { deleteTicketById, findTicketById, findTicketsByOwnerEmail } from "../services/ticketService";
import { sendTicketToOwnerAsPDF } from "../services/emailService";
import { findTicketOption } from "../services/ticketOptionService";

export async function createTicketController(req: Request, res: Response) {
  try {
    const { ticketOptionId, ownerEmail, ownerName } = req.body as ITicketCreateDto;
    if (!ticketOptionId || !ownerEmail || !ownerName) return res.status(400).json(errorMessageObj('ticketOptionIdId, ownerEmail and ownerName are required'));
    const registeredUser = await findUserByEmail(ownerEmail.trim());
    const ticketOption = await findTicketOption(ticketOptionId)
    if (!ticketOption) return res.status(404).json(errorMessageObj('Event not found'));
    try {
      if (registeredUser) {
        const ticket = new Ticket({
          event: ticketOption.event,
          owner: registeredUser._id,
          ownerEmail: ownerEmail.trim(),
          ownerName,
          price: ticketOption.price,
          category: 'Ticket',
          isUsed: false,
        });
        await ticket.save();
        sendTicketToOwnerAsPDF(ticket).catch(() => {});
        return res.json(ticket.toObject());
      }
      else {
        const ticket = new Ticket({
          event: ticketOption.event,
          ownerEmail: ownerEmail.trim(),
          ownerName,
          price: ticketOption.price,
          category: 'Ticket',
          isUsed: false,
        });
        await ticket.save();
        sendTicketToOwnerAsPDF(ticket).catch(() => {});
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

export async function getTicketsByEmailController(req: Request, res: Response) {
  try {
    const { email } = req.query as { email: string };
    if (!email)  return res.status(400).json(errorMessageObj('email is required'));
    
    const tickets = await findTicketsByOwnerEmail(email);
    if (!tickets) return res.status(404).json(errorMessageObj('Tickets2 not found'));
    return res.json(tickets);
  } catch (error) {
    console.error(error);
    return res.status(404).json(errorMessageObj('Tickets1 not found'));
  }
}

export async function getTicketByIdController(req: Request, res: Response) {
  try {
    const { ticketId } = req.params;
    const ticket = await findTicketById(ticketId);
    if (!ticket) return res.status(404).json(errorMessageObj('Ticket not found'));
    return res.json(ticket);
  } catch (error) {
    console.error(error);
    return res.status(404).json(errorMessageObj('Ticket not found'));
  }
}
