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
} from "../services/eventsService";

export async function createEventController(req: Request | any, res: Response) {
  try {
    const data: IEventDto = req.body;
    const { hidden, organizationId, name, description, date, website, price } =
      data;

    if (!organizationId || !name || !date || !price)
      return res
        .status(400)
        .json(
          errorMessageObj(
            "Bad request: organisationId, name, date and price are required"
          )
        );

    const userId = req.userId;
    const org = await findOrganizationById(organizationId);
    if (!org)
      return res.status(404).json(errorMessageObj("Organisation not found"));
    if (org.createdBy.toString() !== userId)
      return res
        .status(403)
        .json(errorMessageObj("Only organisation creator can create events"));
    if (price < 50)
      return res.status(400).json(errorMessageObj("Minimal price is 50 cents"));

    const event = await createNewEvent(data);
    const respData = event.toObject();
    delete respData.stripeProductId;
    return res.status(201).json(respData);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

export async function updateEventController(req: Request | any, res: Response) {
  try {
    const data: IEventUpdateDto = req.body;
    const { eventId } = req.params;
    const userId = req.userId;
    const event = await findEventById(eventId);
    if (!event) return res.status(404).json(errorMessageObj("Event not found"));
    const org = await findOrganizationById(event.organizationId);
    if (org?.createdBy?.toString() != userId)
      return res.status(403).json(errorMessageObj("Only organisation creator can edit events"));
    if (data.price && data.price < 50)
      return res.status(400).json(errorMessageObj("Minimal price is 50 cents"));

    const updatedEvent = await updateEvent(event._id, data);

    const respData = updatedEvent.toObject();
    delete respData.stripeProductId;
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

//TODO
// export async function getAllEventsController(req: Request , res: Response) {
//   try {
//     //TODO - implement filtering and sorting

//   } catch (error) {
//     console.error(error);
//     return res.sendStatus(500);

//   }
// }
