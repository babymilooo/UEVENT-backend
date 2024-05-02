import { Router } from "express";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";
import {
  createEventController,
  deleteEventController,
  getTicketOptionsOfEventController,
  updateEventController,
  getEventById,
  addUserToAttendees,
  getEventsForAttendeeByUserId,
  getEventsByCountryAndSearch,
  getEventsWithFavoriteArtists,
  getEventsByArtistId
} from "../controllers/eventsController";

const eventsRouter = Router();

eventsRouter.get("/:eventId/ticketOptions", getTicketOptionsOfEventController);

eventsRouter.post(
  "/create",
  authGuard,
  refreshTokenMiddleware,
  createEventController
);
eventsRouter.patch(
  "/:eventId",
  authGuard,
  refreshTokenMiddleware,
  updateEventController
);
eventsRouter.delete(
  "/:eventId",
  authGuard,
  refreshTokenMiddleware,
  deleteEventController
);

eventsRouter.get("/get-event/:eventId", getEventById);
eventsRouter.get("/toggle-attendee/:eventId", authGuard, refreshTokenMiddleware, addUserToAttendees);
eventsRouter.get("/events-attendee", authGuard, refreshTokenMiddleware, getEventsForAttendeeByUserId);
eventsRouter.get("/get-events", getEventsByCountryAndSearch);
eventsRouter.get("/get-events-with-favourite-artists", authGuard, refreshTokenMiddleware, getEventsWithFavoriteArtists);
eventsRouter.get("/get-events-artist-id/:artistId", getEventsByArtistId);

export { eventsRouter };
