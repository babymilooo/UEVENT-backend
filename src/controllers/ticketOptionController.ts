import { Request, Response } from "express";
import { errorMessageObj } from "../helpers/errorMessageObj";
import {
  ITicketOptionDto,
  ITicketOptionUpdateDto,
} from "../types/ticketOption";
import { stripeApi } from "../config/stripeConfig";
import { objDataToString } from "../helpers/objDataToString";
import { findEventById } from "../services/eventsService";
import {
  createTicketOption,
  deleteTicketOptionById,
  findTicketOption,
  getTicketOptionsOfEvent,
} from "../services/ticketOptionService";
import { removeUndefKeys } from "../helpers/removeUndefKeys";
import { Types } from "mongoose";
import { ITicketOption, TicketOption } from "../models/ticketOptions";
import { IEvent } from "../models/events";
import { IOrganization } from "../models/organizations";

async function isTicketOptionCreator(
  userId: string | Types.ObjectId,
  ticketOptionId: string | Types.ObjectId
) {
  const tOpt = await TicketOption.findById(ticketOptionId)
    .populate({
      path: "event",
      populate: {
        path: "organizationId",
      },
    })
    .exec();
  if (!tOpt) return false;
  return (
    userId ==
    (
      (tOpt.event as unknown as IEvent)
        .organizationId as unknown as IOrganization
    ).createdBy.toString()
  );
}


export async function createTicketOptionController(
  req: Request,
  res: Response
) {
  try {
    const data = req.body as ITicketOptionDto;
    const { event, name, price, description } = data;
    if (
      !event ||
      !name ||
      !price ||
      typeof event !== "string" ||
      typeof name !== "string" ||
      typeof price !== "number"
    )
      return res
        .status(400)
        .json(errorMessageObj("event, name and price are required"));

    const eventObj = await findEventById(event);
    if (!eventObj) return res.status(404).json("Event not found");
    await eventObj.populate("organizationId");
    const org = eventObj.organizationId as unknown as IOrganization;
    if (org.createdBy != (req as any).userId)
      return res
        .status(403)
        .json(errorMessageObj("Only org creator can add ticket options"));

    const stripeProduct = await stripeApi.products.create({
      name: `Ticket ${name}`,
      description: description ? description : "",
      metadata: objDataToString(data),
      default_price_data: {
        currency: "USD",
        unit_amount: price,
      },
      // url: newEvent.website ? newEvent.website : '',
    });

    const ticketOption = await createTicketOption({
      ...data,
      stripeProductId: stripeProduct.id,
    });

    return res.json(ticketOption);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorMessageObj("Server Error"));
  }
}

export async function updateTicketOptionController(
  req: Request,
  res: Response
) {
  try {
    const { ticketOptionId } = req.params;
    const updateData = req.body as ITicketOptionUpdateDto;
    const { name, price, description } = updateData;

    const ticketOption = await findTicketOption(ticketOptionId);
    if (!ticketOption)
      return res.status(404).json(errorMessageObj("TicketOption not found"));

    if (!isTicketOptionCreator((req as any).userId, ticketOptionId))
      return res
        .status(403)
        .json(errorMessageObj("Only org creator can change ticket options"));

    const productId = ticketOption.stripeProductId;
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
        description: updateData.description
          ? updateData.description
          : undefined,
        // url:
        //   updateData.website && updateData.website?.trim().length > 0
        //     ? updateData.website
        //     : undefined,
      });
      await stripeApi.products.update(stripeProduct.id, {
        ...oldProductData,
        ...newProductData,
      });

      //update stripe price if needed
      const priceId = stripeProduct.default_price as string;
      if (updateData.price && priceId) {
        
        //create new price
        const newPrice = await stripeApi.prices.create({
          currency: 'USD',
          unit_amount: updateData.price,
          product: stripeProduct.id,
        });
        await stripeApi.products.update(stripeProduct.id, {
          default_price: newPrice.id
        });
        //archive old price
        await stripeApi.prices.update(priceId, {
          active: false,
        });
      }
    }
    const sanitizedData = removeUndefKeys({ name, price, description });
    
    await ticketOption.updateOne(sanitizedData);
    return res.json(await findTicketOption(ticketOption._id));
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorMessageObj("Server Error"));
  }
}

export async function deleteTicketOptionController(
  req: Request,
  res: Response
) {
  try {
    const { ticketOptionId } = req.params;
    const ticketOption = await findTicketOption(ticketOptionId);
    if (!ticketOption)
      return res.status(404).json(errorMessageObj("TicketOption not found"));

    if (!isTicketOptionCreator((req as any).userId, ticketOptionId))
      return res
        .status(403)
        .json(errorMessageObj("Only org creator can delete ticket options"));

    await deleteTicketOptionById(ticketOption._id);
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorMessageObj("Server Error"));
  }
}
