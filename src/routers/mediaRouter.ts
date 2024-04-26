import express from "express";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";
import { uploadDynamicMedia } from "../helpers/uploadDynamiMedia";
import { updateOrganizationEventMedia } from "../controllers/mediaController";

const mediaRouter = express.Router();

mediaRouter.patch("/media/:entityType/:id", authGuard, refreshTokenMiddleware, uploadDynamicMedia, updateOrganizationEventMedia);

export { mediaRouter};
