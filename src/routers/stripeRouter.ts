import { Router } from "express";
import { createCheckoutSessionController, getStripeSessionByIdController } from "../controllers/stripeController";
import { injectUserIdIfAuthed } from "../helpers/injectUserIdIfAuthed";

const stripeRouter = Router();

stripeRouter.post('/create-checkout-session', injectUserIdIfAuthed, createCheckoutSessionController);
stripeRouter.get('/session-status', getStripeSessionByIdController);

export {stripeRouter};
