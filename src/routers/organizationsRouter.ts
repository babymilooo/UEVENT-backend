import express from "express";
import { 
  createOrganization, 
  updateOrganization,
  verifyOrganizationByAdmin,
  addFollowerOrganization,
  deleteOrganizationAndEvents,
  getOrganizationById,
  getEventsByOrganization,
  getMyOrganizations,
  getOrganizationsIFollow,
  searchOrganizations, 
  updateOrganizationImage
 } from "../controllers/organizationsController";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";
import { adminAuthGuard } from "../helpers/adminAuthGuard";
import { uploadMultiple } from "../config/configMulter";
const organizationRouter = express.Router();


organizationRouter.post("/create-organization", authGuard, refreshTokenMiddleware, createOrganization);
organizationRouter.patch("/edit-organization/:orgId", authGuard, refreshTokenMiddleware, updateOrganization);
organizationRouter.patch("/edit-organization-image/:orgId", authGuard, refreshTokenMiddleware, uploadMultiple, updateOrganizationImage);
organizationRouter.post("/verify-organization/:orgId", adminAuthGuard, refreshTokenMiddleware, verifyOrganizationByAdmin);
organizationRouter.post("/follow-organization/:orgId", authGuard, refreshTokenMiddleware, addFollowerOrganization);
organizationRouter.get("/get-organization/:orgId", getOrganizationById);
organizationRouter.get("/get-my-organizations", authGuard, refreshTokenMiddleware, getMyOrganizations);
organizationRouter.get("/get-my-organizations-followed", authGuard, refreshTokenMiddleware, getOrganizationsIFollow);
organizationRouter.get("/search", searchOrganizations);
organizationRouter.get("/get-events/:orgId", getEventsByOrganization);
organizationRouter.delete("/delete-organization/:orgId", authGuard, refreshTokenMiddleware, deleteOrganizationAndEvents);

export { organizationRouter};
