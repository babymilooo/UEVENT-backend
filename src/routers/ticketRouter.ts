import { Router } from "express";
import { adminAuthGuard } from "../helpers/adminAuthGuard";
import { createTicketController, deleteTicketController, getMyTickets, getTicketByIdController, getTicketsByEmailController } from "../controllers/ticketController";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";
import { authGuard } from "../helpers/authGuard";

const ticketRouter = Router();

ticketRouter.get('/myTickets', authGuard, refreshTokenMiddleware, getMyTickets);
ticketRouter.get("/byEmail", adminAuthGuard, refreshTokenMiddleware, getTicketsByEmailController);
ticketRouter.get("/:ticketId", adminAuthGuard, refreshTokenMiddleware, getTicketByIdController);
ticketRouter.post("/create", adminAuthGuard, refreshTokenMiddleware, createTicketController);
ticketRouter.delete('/:ticketId', adminAuthGuard, refreshTokenMiddleware, deleteTicketController);

export { ticketRouter };
