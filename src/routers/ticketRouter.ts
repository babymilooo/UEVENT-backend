import { Router } from "express";
import { adminAuthGuard } from "../helpers/adminAuthGuard";
import { createTicketController, deleteTicketController, getTicketByIdController, getTicketsByEmailController } from "../controllers/ticketController";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";

const ticketRouter = Router();

ticketRouter.get("/byEmail", adminAuthGuard, refreshTokenMiddleware, getTicketsByEmailController);
ticketRouter.get("/:ticketId", adminAuthGuard, refreshTokenMiddleware, getTicketByIdController);
ticketRouter.post("/create", adminAuthGuard, refreshTokenMiddleware, createTicketController);
ticketRouter.delete('/:ticketId', adminAuthGuard, refreshTokenMiddleware, deleteTicketController);

export { ticketRouter };
