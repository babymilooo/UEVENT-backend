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
  getOrganizations,
  addFollowerCount,
  validateContactDetails,
  findOrganizationByName,
  getOrganizationsByName
 } from "../services/organizationsService";
import { IOrganizationUpdateDto, IOrganizationDto } from "../types/organization";
import { handleImageUpdate, removeFiles } from "../helpers/updateAndDeleteImage";
import { sendOrganisationVerifiedEmail, sendRequestOrgVerificationEmail } from "../services/emailService";


export async function createOrganization(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string; 
    const orgData: IOrganizationDto = req.body;
    if (!orgData.name || !orgData.email|| !orgData.phone)
      return res.status(400).json(errorMessageObj("All fields are required."));

    await validateContactDetails(orgData.email, orgData.phone);

    const newOrganization = await createNewOrganization(orgData, userId);
    //asyncronously send emails to admins
    await sendRequestOrgVerificationEmail(newOrganization);

    res.status(200).json(await addFollowerCount(newOrganization));
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
    await validateContactDetails(updateData.email || '', updateData.phone || '');

    const currentOrg = await findOrganizationById(orgId);
    if (updateData.name && updateData.name !== currentOrg.name) {
      const existingOrg = await findOrganizationByName(updateData.name);
      if (existingOrg && existingOrg._id !== orgId)
        return res.status(409).json(errorMessageObj("An organization with this name already exists"));
    }
  
    const updatedOrganization = await updateOrganizationByIdAndUserId(orgId, userId, updateData);
    res.status(200).json(await addFollowerCount(updatedOrganization));
  } catch (error: any) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("An error occurred while editing the organization"));
  }
}

export async function updateOrganizationImage(req: Request, res: Response) {
  try {
    const orgId = req.params.orgId; 
    const files: { [fieldname: string]: Express.Multer.File[] } = req.files as any;

    if (!files || Object.keys(files).length === 0)
      return res.status(400).json(errorMessageObj("No image uploaded."));
    
    const currentOrg = await findOrganizationById(orgId);
    await handleImageUpdate(currentOrg, "", files);
    await currentOrg.save();

    res.status(200).json(await addFollowerCount(currentOrg));
  } catch (error: any) {
    if (req.files)
      await removeFiles(req.files);
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("An error occurred while updating the image."));
  }
}


export async function verifyOrganizationByAdmin(req: Request, res: Response) {
  try {
    const orgId  = req.params.orgId;
    const updatedOrganization = await verifyOrganization(orgId);
    if (!updatedOrganization)
      return res.status(404).json(errorMessageObj("Organization not found"));
    //send email to organiser
    sendOrganisationVerifiedEmail(updatedOrganization);
    res.status(200).json(await addFollowerCount(updatedOrganization));
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
    res.status(200).json(await addFollowerCount(updatedOrganization));
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

    res.status(200).json('Successfully deleted organization and events.');
  } catch (error) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("An error occurred while deleting the organization and its events"));
  }
}

export async function getOrganizationById(req: Request, res: Response) {
  try {
    const { orgId } = req.params;
    const organization = await findOrganizationById(orgId);
    if (!organization)
      return res.status(404).json(errorMessageObj("Organization not found or not verified"));

    res.status(200).json(await addFollowerCount(organization));
  } catch (error) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("Error loading organization data"));
  }
}

export async function getEventsByOrganization(req:  Request, res: Response) {
  try {
    const { orgId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const events = await getEventsByIdOrganization(orgId, skip, limit);

    res.status(200).json(events);
  } catch (error) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("Error loading organization data"));
  }
}

export async function getMyOrganizations(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string; 
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const organizations = await getOrganizations({ createdBy: userId }, page, limit);
    res.status(200).json(organizations);
  } catch (error) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("Error loading organization data"));
  }
}

export async function getOrganizationsIFollow(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const organizations = await getOrganizations({ followers: userId }, page, limit);
    res.status(200).json(organizations);
  } catch (error) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("Error loading organization data"));
  }
}


export async function searchOrganizations(req: Request, res: Response) {
  try {
    const name = req.query.name as string;  
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10; 

    if (!name) 
      return res.status(400).json({ message: "Name parameter is required for search." });

    const organizations = await getOrganizationsByName(name, page, limit);
    res.status(200).json(organizations);
  } catch (error) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("Error loading organization data"));
  }
}
