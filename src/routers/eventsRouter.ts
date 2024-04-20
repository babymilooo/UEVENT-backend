import { Router } from "express";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";
import { createEventController, deleteEventController, updateEventController } from "../controllers/eventsController";

const eventsRouter = Router();

eventsRouter.post('/create', authGuard, refreshTokenMiddleware, createEventController);
eventsRouter.patch('/:eventId', authGuard, refreshTokenMiddleware, updateEventController);
eventsRouter.delete('/:eventId', authGuard, refreshTokenMiddleware, deleteEventController);

export {eventsRouter};
