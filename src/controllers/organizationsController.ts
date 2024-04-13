import { Request, Response } from "express";
import { errorMessageObj } from "../helpers/errorMessageObj";
import { createNewOrganization } from "../services/organizationsService";

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
