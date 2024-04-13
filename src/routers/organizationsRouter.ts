import express from "express";
import { 
  createOrganization, 
  updateOrganization,
  verifyOrganizationByAdmin,
  addFollowerOrganization,
  deleteOrganizationAndEvents
 } from "../controllers/organizationsController";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";
import { adminAuthGuard } from "../helpers/adminAuthGuard";

const organizationRouter = express.Router();

organizationRouter.post("/create-organization", authGuard, refreshTokenMiddleware, createOrganization);
organizationRouter.patch("/edit-organization/:orgId", authGuard, refreshTokenMiddleware, updateOrganization);
organizationRouter.post("/verify-organization/:orgId", adminAuthGuard, refreshTokenMiddleware, verifyOrganizationByAdmin);
organizationRouter.post("/follow-organization/:orgId", authGuard, refreshTokenMiddleware, addFollowerOrganization);
organizationRouter.post("/delete-organization/:orgId", authGuard, refreshTokenMiddleware, deleteOrganizationAndEvents);


export { organizationRouter};
