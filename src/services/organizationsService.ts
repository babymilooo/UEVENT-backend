import { Organization } from "../models/organizations";
import { IOrganizationDto, IOrganizationUpdateDto } from "../types/organization";



export async function createNewOrganization(orgDTO: IOrganizationDto, userId: string) {
  try {
    if (!userId || !orgDTO.name)
      throw new Error("Required fields are missing");

    const existingOrg = await findOrganizationByName(orgDTO.name);
    if (existingOrg && existingOrg.createdBy.toString() === userId) 
      throw new Error("An organization with this name already exists");

    const orgObj: any = {
      ...orgDTO,
      createdBy: userId
    }
    const newOrganization = new Organization(orgObj);
    await newOrganization.save();
    return newOrganization;
  } catch (error) {
    throw new Error("Organization already exists");
  }
}

export async function findOrganizationByName(name: string) {
  return await Organization.findOne({ name: name }).exec();
}