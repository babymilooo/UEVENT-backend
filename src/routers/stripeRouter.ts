import { Router } from "express";
import {
  createCheckoutSessionController,
  getStripeSessionByIdController,
  stripeCheckoutWebhook,
} from "../controllers/stripeController";
import { injectUserIdIfAuthed } from "../helpers/injectUserIdIfAuthed";

const stripeRouter = Router();

stripeRouter.post(
  "/create-checkout-session",
  injectUserIdIfAuthed,
  createCheckoutSessionController
);
stripeRouter.get("/session-status", getStripeSessionByIdController);
stripeRouter.post("/webhook", stripeCheckoutWebhook);

export { stripeRouter };
