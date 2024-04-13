import { Request, Response } from "express";
import { errorMessageObj } from "../helpers/errorMessageObj";
import { 
  createNewOrganization,
  updateOrganizationByIdAndUserId,
  verifyOrganization,
  addFollower,
  findOrganizationById,
  deleteAllEventsByOrganization,
  deleteOrganization,
  checkIfUserIsCreator,
  getEventsByIdOrganization,
  getOrganizationsByCreate,
  getOrganizationIfUserInFollowers
 } from "../services/organizationsService";
import { IOrganizationUpdateDto } from "../types/organization";

export async function createOrganization(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string; 
    const orgData = req.body
    const newOrganization = await createNewOrganization(orgData, userId)
    res.status(200).json(newOrganization);
  } catch (error: any) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("An error occurred while creating the organization"));
  }
}

export async function updateOrganization(req: Request, res: Response) {
  try {
    const orgId = req.params.orgId;
    const userId = (req as any).userId as string; 
    const updateData: IOrganizationUpdateDto = req.body;

    if (!orgId || !userId || !updateData) 
      return res.status(400).json(errorMessageObj("Missing organization ID or update data"));

    const updatedOrganization = await updateOrganizationByIdAndUserId(orgId, userId, updateData);
    res.status(200).json(updatedOrganization);
  } catch (error) {
    res.status(500).json(errorMessageObj("An error occurred while editing the organization"));
  }
}


export async function verifyOrganizationByAdmin(req: Request, res: Response) {
  try {
    const orgId  = req.params.orgId;
    const updatedOrganization = await verifyOrganization(orgId);
    if (!updatedOrganization)
      return res.status(404).json(errorMessageObj("Organization not found"));
    res.status(200).json(updatedOrganization);
  } catch (error) {
    res.status(500).json(errorMessageObj("An error occurred while verifying the organization"));
  }
}

export async function addFollowerOrganization(req: Request, res: Response) {
  try {
    const orgId = req.params.orgId;
    const userId = (req as any).userId as string; 
    const organization = await findOrganizationById(orgId);
    const isCreator = await checkIfUserIsCreator(organization, userId);
    if (isCreator) res.status(500).json(errorMessageObj("You cannot follow your own organization"));

    const updatedOrganization = await addFollower(organization, userId);
    res.status(200).json(updatedOrganization);
  } catch (error: unknown) {
    if (error instanceof Error)
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("An error occurred while following the organization"));
  }
}

export async function deleteOrganizationAndEvents(req: Request, res: Response) {
  try {
    const { orgId } = req.params;
    const userId = (req as any).userId as string;

    const organization = await findOrganizationById(orgId);
    const isCreator = await checkIfUserIsCreator(organization, userId);
    if (!isCreator) return res.status(403).json(errorMessageObj("You are not authorized to delete this organization"));

    await deleteAllEventsByOrganization(orgId);
    await deleteOrganization(orgId);

    res.status(200);
  } catch (error) {
    res.status(500).json(errorMessageObj("An error occurred while deleting the organization and its events"));
  }
}

export async function getOrganizationById(req: Request, res: Response) {
  try {
    const { orgId } = req.params;
    const organization = await findOrganizationById(orgId);
    res.status(200).json(organization);
  } catch (error) {
    res.status(500).json(errorMessageObj("Error loading organization data"));
  }
}


export async function getEventsByOrganization(req:  Request, res: Response) {
  try {
    const { orgId } = req.params;
    const page = typeof req.query.page === "string" ? parseInt(req.query.page) : 1;
    const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const events = await getEventsByIdOrganization(orgId, skip, limit);

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json(errorMessageObj("Error loading organization data"));
  }
}

export async function getMyOrganizations(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string; 
    const organizations = await getOrganizationsByCreate(userId);
    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json(errorMessageObj("Error loading organization data"));
  }
}

export async function getOrganizationsIFollow(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const organizations = await getOrganizationIfUserInFollowers(userId);
    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json(errorMessageObj("Error loading organization data"));
  }
}