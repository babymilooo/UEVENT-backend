import { Request, Response } from "express";
import { errorMessageObj } from "../helpers/errorMessageObj";
import { findUserById } from "../services/userService";
import { Event } from "../models/events";
import { stripeApi } from "../config/stripeConfig";
import Stripe from "stripe";
import { FRONTEND_URL } from "../config/emailConfig";

export async function createCheckoutSessionController(
  req: Request | any,
  res: Response
) {
  try {
    const { eventId } = req.body;
    if (!eventId)
      return res.status(400).json(errorMessageObj("eventId is required"));
    const event = await Event.findById(eventId).exec();
    if (!event) return res.status(404).json(errorMessageObj("Event not found"));
    if (!event.stripeProductId)
      return res
        .status(404)
        .json(
          errorMessageObj("Event has no associated product(No price is set)")
        );
    const product = await stripeApi.products.retrieve(event.stripeProductId, {
      expand: ["default_price"],
    });
    if (!product)
      return res
        .status(404)
        .json(
          errorMessageObj("Event has no associated product(No price is set)")
        );
    const stripePrice: Stripe.Price | null | undefined =
      product.default_price as Stripe.Price;
    if (!stripePrice)
      return res
        .status(404)
        .json(
          errorMessageObj("Event has no associated price(No price is set)")
        );

    const userId = req.userId;

    if (userId) {
      const user = await findUserById(userId);
      if (!user)
        return res
          .status(404)
          .json(errorMessageObj("Authenticated User not found"));

      const session = await stripeApi.checkout.sessions.create({
        ui_mode: "embedded",
        mode: "payment",
        line_items: [
          {
            price: stripePrice.id,
            quantity: 1,
          },
        ],
        return_url: `${FRONTEND_URL}/payment-return?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          eventId: eventId,
          userId: userId,
        },
        customer_email: user.email,
      });
      return res.json({ clientSecret: session.client_secret });
    } else {
      const session = await stripeApi.checkout.sessions.create({
        ui_mode: "embedded",
        mode: "payment",
        line_items: [
          {
            price: stripePrice.id,
            quantity: 1,
          },
        ],
        return_url: `${FRONTEND_URL}/payment-return?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          eventId: eventId,
        },
      });
      return res.json({ clientSecret: session.client_secret });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorMessageObj("Server error"));
  }
}

export async function getStripeSessionByIdController(req: Request, res: Response) {
  try {
    if (!req.query.session_id || typeof req.query.session_id !== "string")
      return res
        .status(400)
        .json(errorMessageObj("session_id is required and must be string"));

    const session = await stripeApi.checkout.sessions.retrieve(
      req.query.session_id
    );
    if (!session)
      return res.status(404).json(errorMessageObj("Session not found"));

    res.json({
      status: session.status,
      customer_email: session.customer_email,
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json(errorMessageObj("Session not found"));
  }
}