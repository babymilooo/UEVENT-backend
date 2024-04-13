import { Organization } from "../models/organizations";
import { Event } from "../models/events";
import { IOrganizationDto, IOrganizationUpdateDto } from "../types/organization";
import mongoose from 'mongoose';

export async function createNewOrganization(orgDTO: IOrganizationDto, userId: string) {
  try {
    if (!userId || !orgDTO.name)
      throw new Error("Required fields are missing");

    const existingOrg = await findOrganizationByName(orgDTO.name);
    console.log(existingOrg);
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
    throw error;
  }
}

export async function findOrganizationByName(name: string) {
  return await Organization.findOne({ name: name }).exec();
}

export async function updateOrganizationByIdAndUserId(orgId: string, userId: string, updateData: IOrganizationUpdateDto) {
  const conditions = {
    _id: orgId,
    createdBy: userId
  };
  
  return await Organization.findOneAndUpdate(conditions, updateData, { new: true }).exec();
}

export async function verifyOrganization(orgId: string) {
  return await Organization.findByIdAndUpdate(orgId, { isVerified: true }, { new: true }).exec();
}

export async function checkIfUserIsCreator(organization: any, userId: string) {
  return organization.createdBy.toString() === userId;
}

export async function findOrganizationById(id: string) {
  const org = await Organization.findById(id).exec();
  if (!org) 
    throw new Error("Organization not found");
  return org;
}

export async function addFollower(organization: any, userId: string) {
  if (organization.followers.some((id: any) => id.toString() === userId)) 
    throw new Error('You are already following this organization');
  
  organization.followers.push(new mongoose.Types.ObjectId(userId));
  await organization.save();
  return organization;
}


export async function deleteAllEventsByOrganization(orgId: string) {
  await Event.deleteMany({ organizationId: orgId });
}

export async function deleteOrganization(orgId: string) {
  await Organization.findByIdAndDelete(orgId)
}

export async function getEventsByIdOrganization(orgId: string, skip: number, limit: number) {
  return await Event.find({ organizationId: orgId })
                            .sort({ date: 1 })
                            .skip(skip)
                            .limit(limit);
}

export async function getOrganizationsByCreate(userId: string) {
  return await Organization.find({ createdBy: userId });
}

export async function getOrganizationIfUserInFollowers(userId: string) {
  return await Organization.find({ followers: userId });
}