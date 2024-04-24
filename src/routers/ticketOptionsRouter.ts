import { Router } from "express";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";
import { createTicketOptionController, deleteTicketOptionController, updateTicketOptionController } from "../controllers/ticketOptionController";

const ticketOptionsRouter = Router();

ticketOptionsRouter.post('/create', authGuard, refreshTokenMiddleware, createTicketOptionController);
ticketOptionsRouter.patch('/:ticketOptionId', authGuard, refreshTokenMiddleware, updateTicketOptionController);
ticketOptionsRouter.delete('/:ticketOptionId', authGuard, refreshTokenMiddleware, deleteTicketOptionController);

export { ticketOptionsRouter };
