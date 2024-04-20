import { FilterQuery, Types } from "mongoose";
import { stripeApi } from "../config/stripeConfig";
import { removeUndefKeys } from "../helpers/removeUndefKeys";
import { Event, IEvent, ISchemaEvent } from "../models/events";
import { IEventDto, IEventUpdateDto } from "../types/event";
import { findOrganizationById } from "./organizationsService";
import { objDataToString } from "../helpers/objDataToString";

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
  return await Event.findById(id).exec();
}

export async function deleteEventById(id: string | Types.ObjectId) {
  return await Event.findByIdAndDelete(id).exec();
}

export async function createNewEvent(data: IEventDto): Promise<IEvent> {
  const org = await findOrganizationById(data.organizationId);
  if (!org) throw new Error("Organisation does not exist");

  const newEvent = new Event({
    ...data,
    attendees: [],
  });

  const stripeProduct = await stripeApi.products.create({
    name: `Ticket ${newEvent.name}`,
    description: newEvent.description || "",
    metadata: objDataToString(await newEvent.toObject()),
    default_price_data: {
      currency: "USD",
      unit_amount: newEvent.price,
    },
    url: newEvent.website || "",
  });
  newEvent.stripeProductId = stripeProduct.id;
  await newEvent.save();

  return newEvent;
}

export async function updateEvent(
  id: string | Types.ObjectId,
  updateData: IEventUpdateDto
): Promise<IEvent> {
  const event = await findEventById(id);
  if (!event) throw new Error("Event not found");
  

  const productId = event.stripeProductId;
  if (productId) {
    // update stripe product
    const stripeProduct = await stripeApi.products.retrieve(productId);
    const oldProductData = removeUndefKeys({
      name: stripeProduct.name,
      description: stripeProduct.description,
      url: stripeProduct.url,
    });
    const newProductData = removeUndefKeys({
      name: updateData.name ? `Ticket ${updateData.name}` : undefined,
      description: updateData.description ? updateData.description : undefined,
      url:
        updateData.website && updateData.website?.trim().length > 0
          ? updateData.website
          : undefined,
    });
    await stripeApi.products.update(stripeProduct.id, {
      ...oldProductData,
      ...newProductData
    });

    //update stripe price if needed
    const priceId = stripeProduct.default_price as string;
    if (updateData.price && priceId) {
      await stripeApi.prices.update(priceId, {
        currency_options: {
          USD: {
            unit_amount: updateData.price,
          },
        },
      });
    }
  }
  await event.updateOne(updateData).exec();
  const newEvent = await findEventById(id);
  if (!newEvent) throw new Error("Event not found");

  return newEvent;
}
