import { Request, Response } from "express";
import { errorMessageObj } from "../helpers/errorMessageObj";
import { findUserById } from "../services/userService";
import { Event } from "../models/events";
import { stripeApi } from "../config/stripeConfig";
import Stripe from "stripe";
import { FRONTEND_URL } from "../config/emailConfig";
import { createNewTicket } from "../services/ticketService";
import { sendTicketToOwnerAsPDF } from "../services/emailService";
import { findTicketOption } from "../services/ticketOptionService";

export async function createCheckoutSessionController(
  req: Request | any,
  res: Response
) {
  try {
    const { ticketOptionId, ownerName } = req.body;
    if (!ticketOptionId || typeof ticketOptionId !== "string")
      return res
        .status(400)
        .json(errorMessageObj("ticketOptionId is required"));
    if (!ownerName || typeof ownerName !== "string")
      return res.status(400).json(errorMessageObj("ownerName is required"));
    const ticketOption = await findTicketOption(ticketOptionId);
    if (!ticketOption)
      return res.status(404).json(errorMessageObj("TicketOption not found"));
    if (ticketOption.quantity <= 0)
      return res
        .status(409)
        .json(errorMessageObj("TicketOption not available/sold out"));

    const product = await stripeApi.products.retrieve(
      ticketOption.stripeProductId,
      {
        expand: ["default_price"],
      }
    );
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
          ticketOptionId: ticketOptionId,
          eventId: ticketOption.event.toString(),
          userId: userId,
          ownerName,
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
          ticketOptionId: ticketOptionId,
          eventId: ticketOption.event.toString(),
          ownerName,
        },
      });
      return res.json({ clientSecret: session.client_secret });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorMessageObj("Server error"));
  }
}

export async function getStripeSessionByIdController(
  req: Request,
  res: Response
) {
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

    return res.json({
      status: session.status,
      customer_email: session.customer_email,
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json(errorMessageObj("Session not found"));
  }
}

export function stripeCheckoutWebhook(req: Request, res: Response) {
  const event: Stripe.Event = req.body;
  switch (event.type) {
    case "checkout.session.completed":
      const session: Stripe.Checkout.Session = event.data.object;
      const userEmail =
        session.customer_email || session.customer_details?.email;
      // const userEmail = 'mark.tkachev2004@gmail.com'

      // console.log(userEmail);

      if (!userEmail) break;
      const { ticketOptionId, ownerName } = session.metadata as any;
      // console.log(session.metadata);

      if (!ticketOptionId || !ownerName) break;
      createNewTicket(ticketOptionId, userEmail, ownerName)
        .then((ticket) => {
          sendTicketToOwnerAsPDF(ticket).catch(() => {});
        })
        .catch((error) => console.log(error));

      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }
  return res.json({ received: true });
}
