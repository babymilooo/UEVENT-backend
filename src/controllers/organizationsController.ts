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
  checkIfUserIsCreator
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