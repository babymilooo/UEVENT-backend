import express from "express";
import { createOrganization } from "../controllers/organizationsController";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";

const organizationRouter = express.Router();

organizationRouter.post("/create-organization", authGuard, refreshTokenMiddleware, createOrganization);


export { organizationRouter};
