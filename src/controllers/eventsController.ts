import "dotenv/config";
import { Request, Response } from "express";
import { IEventDto, IEventUpdateDto } from "../types/event";
import { errorMessageObj } from "../helpers/errorMessageObj";
import { findOrganizationById } from "../services/organizationsService";
import {
  createNewEvent,
  deleteEventById,
  findAllEventsOrganisation,
  findEventById,
  updateEvent,
  toggleAttendee,
  getEventsForAttendee,
  getEventsByCountry
} from "../services/eventsService";
import { getTicketOptionsOfEvent } from "../services/ticketOptionService";
import { checkEventOrganization } from "../services/eventsService";
import { modifyMultipleEntityPaths, modifyEntityPaths } from "../helpers/updateAndDeleteImage";
const EVENT_URL = process.env.EVENT_URL || "/static/event/";

export async function getTicketOptionsOfEventController(
  req: Request,
  res: Response
) {
  try {
    const { eventId } = req.params;
    const event = await findEventById(eventId);
    if (!event) return res.status(404).json(errorMessageObj('Event not found'));

    const tOpts = await getTicketOptionsOfEvent(event._id);
    return res.json(tOpts);
  } catch (error) {
    console.error(error);
    return res.status(404).json(errorMessageObj('Ticket Options not found'))
  }
}

export async function createEventController(req: Request | any, res: Response) {
  try {
    const data: IEventDto = req.body;
    const { organizationId, name, date } = data;

    if (!organizationId || !name || !date)
      return res.status(400)
        .json(
          errorMessageObj(
            "Bad request: organisationId, name, date and price are required"
          )
        );
    
    const userId = req.userId;
    const org = await findOrganizationById(organizationId);

    if (org.createdBy.toString() !== userId)
      return res.status(403).json(errorMessageObj("Only organisation creator can create events"));
    if (!org.isVerified) 
      return res.status(403).json(errorMessageObj("Only verified organisations can create events")); 

    const event = await createNewEvent(data);
    await event.populate('ticketOptions');
    const respData = event.toObject({ virtuals: true });

    res.status(201).json(respData);
  } catch (error) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.sendStatus(500);
  }
}

export async function updateEventController(req: Request | any, res: Response) {
  try {
    const data: IEventUpdateDto = req.body;
    
    const { eventId } = req.params;
    const userId = req.userId;
    const event = await checkEventOrganization(eventId, userId);
    
    const updatedEvent = await updateEvent(event._id, data);
    await updatedEvent.populate('ticketOptions');
    const respData = updatedEvent.toObject({ virtuals: true });
    return res.json(respData);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

export async function deleteEventController(req: Request | any, res: Response) {
  try {
    const { eventId } = req.params;
    const userId = req.userId;
    const event = await findEventById(eventId);
    if (!event) return res.status(404).json(errorMessageObj("Event not found"));
    const org = await findOrganizationById(event.organizationId);
    if (org?.createdBy?.toString() != userId)
      return res.status(403).json(errorMessageObj("Only organisation creator can delete events"));
    
    await deleteEventById(event._id);

    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

export async function getEventById(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId;
    const event = await findEventById(eventId);
    if (!event)
      return res.status(404).json(errorMessageObj("Event not found or not verified"));

    const org = await findOrganizationById(event.organizationId);
    if (!org.isVerified) 
      throw new Error("Only verified organisations can view event"); 

    const respData = event.toObject({ virtuals: true });
    res.status(200).json(await modifyEntityPaths(respData, EVENT_URL));
  } catch (error) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("Error loading organization data"));
  }
}

export async function addUserToAttendees(req: Request | any, res: Response) {
  try {
    const eventId = req.params.eventId;
    const userId = req.userId;
    const event = await findEventById(eventId);
    if (!event)
      return res.status(404).json(errorMessageObj("Event not found or not verified"));

    const org = await findOrganizationById(event.organizationId);
    if (!org.isVerified) 
      throw new Error("Only verified organisations can view event"); 
  
    const newEvent = await toggleAttendee(event, userId);
    const respData = newEvent.toObject({ virtuals: true });
    res.status(200).json(await modifyEntityPaths(respData, EVENT_URL));
  } catch (error) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("Error processing your request"));
  }
}

export async function getEventsForAttendeeByUserId(req: Request | any, res: Response) {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;  
    const limit = parseInt(req.query.limit) || 10;
    const eventsOld = await getEventsForAttendee(userId, page, limit);
    const events: any = eventsOld.map(event => {
      const eventData = event.toObject({ virtuals: true }); 
      return eventData;
    });
    res.status(200).json(await modifyMultipleEntityPaths(events, EVENT_URL));
  } catch (error) {
    res.status(500).json(errorMessageObj('Error retrieving events' ));
  }
}

export async function getEventsByCountryAndSearch(req: Request | any, res: Response) {
  try {
  
    const countryCode = req.query.countryCode;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const artists = req.query.artists ? JSON.parse(req.query.artists) : [];
    const eventName = req.query.eventName || "";
    const startDate = req.query.startDate || "";
    const endDate = req.query.endDate || "";
    const order = req.query.order || "newest";
    
    const searchOptions = {
      countryCode,
      page,
      limit,
      artists,
      eventName,
      startDate,
      endDate,
      order
    };
    const result = await getEventsByCountry(searchOptions);
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json(errorMessageObj('Server error'));
  }
}


//TODO
// export async function getAllEventsController(req: Request , res: Response) {
//   try {
//     //TODO - implement filtering and sorting

//   } catch (error) {
//     console.error(error);
//     return res.sendStatus(500);

//   }
// }
