import { FilterQuery, Types } from "mongoose";
import { stripeApi } from "../config/stripeConfig";
import { removeUndefKeys } from "../helpers/removeUndefKeys";
import { Event, IEvent, ISchemaEvent } from "../models/events";
import { IEventDto, IEventUpdateDto } from "../types/event";
import { findOrganizationById } from "./organizationsService";
import { objDataToString } from "../helpers/objDataToString";
import mongoose from 'mongoose';
import { modifyMultipleEntityPaths } from "../helpers/updateAndDeleteImage";
import { fetchArtistById } from "./artistService";
const EVENT_URL = process.env.EVENT_URL || "/static/event/";

export async function findAllEventsOrganisation(
  orgId: string | Types.ObjectId,
  includeHidden: boolean = true
) {
  if (includeHidden) return await Event.find({ organizationId: orgId }).exec();
  else return await Event.find({ organizationId: orgId, hidden: false }).exec();
}

export async function findAllEvents(filter: FilterQuery<ISchemaEvent> = {}) {
  return await Event.find(filter).exec();
}

export async function findEventById(id: string | Types.ObjectId) {
  const event = Event.findById(id).exec();
  if (!event) 
    throw new Error("Event not found");
  
  return event;
}

export async function deleteEventById(id: string | Types.ObjectId) {
  return await Event.findByIdAndDelete(id).exec();
}

export async function createNewEvent(data: IEventDto): Promise<IEvent> {
  // const org = await findOrganizationById(data.organizationId);
  // if (!org) throw new Error("Organisation does not exist");
  const newEvent = new Event({
    ...data,
    attendees: [],
  });
  await newEvent.save();

  return newEvent;
}

export async function updateEvent(
  id: string | Types.ObjectId,
  updateData: IEventUpdateDto
): Promise<IEvent> {
  const event = await findEventById(id);
  if (!event) throw new Error("Event not found");

  
  await event.updateOne(updateData).exec();
  const newEvent = await findEventById(id);
  if (!newEvent) throw new Error("Event not found");

  return newEvent;
}

export async function checkEventOrganization(eventId: string, userId: string) {
  const event = await findEventById(eventId);
  if (!event) throw new Error("Event not found");
  const org = await findOrganizationById(event.organizationId);
  if (org?.createdBy?.toString() != userId)
    throw new Error("Only organisation creator can edit events");
  if (!org.isVerified) 
    throw new Error("Only verified organisations can edit events"); 
  return event;
}


export async function toggleAttendee(event: any, userId: string) {
  if (event.attendees.some((id: any) => id.toString() === userId))
    event.attendees = event.attendees.filter((id: any) => id.toString() !== userId);
  else
    event.attendees.push(new mongoose.Types.ObjectId(userId));

  await event.save();
  return event;
}

//count і скільки сторінок буде 
export async function getEventsForAttendee(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  return await Event.find({ attendees: userId })
                    .skip(skip)
                    .limit(limit)
                    .exec();
}

export async function getEventsByCountry(options: any) {
  const {
    countryCode,
    page,
    limit,
    artists,
    eventName,
    startDate,
    endDate,
    order
  } = options;

  const matchStage: any = {};
  if (countryCode)
    matchStage['location.countryCode'] = countryCode;

  if (artists && artists.length > 0) {
    matchStage['artists'] = { $in: artists };
  }

  if (eventName && eventName.trim()) {
    matchStage['name'] = { $regex: new RegExp(eventName, 'i') };
  }

  if (startDate || endDate) {
    matchStage['date'] = {};
  
    if (startDate)
      matchStage['date'].$gte = new Date(startDate);
  
    if (endDate)
      matchStage['date'].$lte = new Date(endDate);
  }

  const pipeline: any[] = [
    {
      $lookup: {
        from: "organizations",
        localField: "organizationId",
        foreignField: "_id",
        as: "organization"
      }
    },
    {
      $unwind: "$organization" 
    },
    {
      $match: {
        ...matchStage,
        "organization.isVerified": true
      }
    },
    {
      $sort: {
        date: order === "newest" ? -1 : 1
      }
    },
    {
      $skip: (page - 1) * limit
    },
    {
      $limit: limit
    }
  ];
  try {
    const eventsFirst = await Event.aggregate(pipeline).exec();
    const total = await Event.countDocuments(matchStage);
    const eventTwo = await modifyMultipleEntityPaths(eventsFirst, EVENT_URL)
    return {
      total,
      page,
      pages: Math.ceil(total / limit),
      events: eventTwo
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}


export async function getEventsUserWithFavouriteArtists(artists: string[]) {
  const artistEventsArray: any[] = [];

  for (const artist of artists) {
    const events = await Event.find({
      artists: artist,
      hidden: false
    });

    if (events.length > 0) {
      const modifiedEvents = await modifyMultipleEntityPaths(events, EVENT_URL);
      const infoByartist = await fetchArtistById(artist);
      artistEventsArray.push({
        artist: {
          id: infoByartist.id,       
          name: infoByartist.name,   
          images: infoByartist.images[0].url,
          followers: infoByartist.followers.total
        },
        events: modifiedEvents
      });
    }
  }
  return artistEventsArray;
}