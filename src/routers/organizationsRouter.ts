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
  searchOrganizationsByNameAndUser
 } from "../controllers/organizationsController";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";
import { adminAuthGuard } from "../helpers/adminAuthGuard";
//import { uploadOrganizationPicture, uploadOrganizationLogo } from "../config/configMulter";
const organizationRouter = express.Router();


organizationRouter.post("/create-organization", authGuard, refreshTokenMiddleware, createOrganization);
organizationRouter.patch("/edit-organization/:orgId", authGuard, refreshTokenMiddleware, updateOrganization);

// organizationRouter.patch("/edit-organization-pictures/:orgId", authGuard, refreshTokenMiddleware, uploadOrganizationLogo.single("logo"), updateOrganizationLogo);
// organizationRouter.patch("/edit-organization-picture/:orgId", authGuard, refreshTokenMiddleware, uploadOrganizationPicture.single("picture"), updateOrganizationPicture);

organizationRouter.post("/verify-organization/:orgId", adminAuthGuard, refreshTokenMiddleware, verifyOrganizationByAdmin);
organizationRouter.post("/follow-organization/:orgId", authGuard, refreshTokenMiddleware, addFollowerOrganization);
organizationRouter.get("/get-organization/:orgId", getOrganizationById);
organizationRouter.get("/get-my-organizations", authGuard, refreshTokenMiddleware, getMyOrganizations);
organizationRouter.get("/get-my-organizations-followed", authGuard, refreshTokenMiddleware, getOrganizationsIFollow);
organizationRouter.get("/search-my-organizations", authGuard, refreshTokenMiddleware, searchOrganizationsByNameAndUser);
organizationRouter.get("/get-events/:orgId", getEventsByOrganization);
organizationRouter.delete("/delete-organization/:orgId", authGuard, refreshTokenMiddleware, deleteOrganizationAndEvents);

export { organizationRouter};
