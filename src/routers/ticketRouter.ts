import { Router } from "express";
import { adminAuthGuard } from "../helpers/adminAuthGuard";
import { createTicketController, deleteTicketController } from "../controllers/ticketController";

const ticketRouter = Router();

ticketRouter.post("/create", adminAuthGuard, createTicketController);
ticketRouter.delete('/:ticketId', adminAuthGuard, deleteTicketController);

export { ticketRouter };
