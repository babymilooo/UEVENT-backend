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
  getOrganizationsIFollow
 } from "../controllers/organizationsController";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";
import { adminAuthGuard } from "../helpers/adminAuthGuard";
import { uploadOrganizationImages } from "../config/configMulter";

const organizationRouter = express.Router();
//протестила
organizationRouter.post("/create-organization", authGuard, refreshTokenMiddleware, uploadOrganizationImages.single('image'), createOrganization);
organizationRouter.patch("/edit-organization/:orgId", authGuard, refreshTokenMiddleware, uploadOrganizationImages.single('image'), updateOrganization);
organizationRouter.post("/verify-organization/:orgId", adminAuthGuard, refreshTokenMiddleware, verifyOrganizationByAdmin);
organizationRouter.post("/follow-organization/:orgId", authGuard, refreshTokenMiddleware, addFollowerOrganization);
// не протестила
organizationRouter.delete("/delete-organization/:orgId", authGuard, refreshTokenMiddleware, deleteOrganizationAndEvents);
organizationRouter.get("/get-organization/:orgId", getOrganizationById);
organizationRouter.get("/get-events/:orgId", getEventsByOrganization);
organizationRouter.get("/get-my-organizations/:orgId", authGuard, refreshTokenMiddleware, getMyOrganizations);
organizationRouter.get("/get-my-organizations-followed", authGuard, refreshTokenMiddleware, getOrganizationsIFollow);


export { organizationRouter};
