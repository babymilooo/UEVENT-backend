import "dotenv/config";
import { IOrganization, Organization } from "../models/organizations";
import { Event } from "../models/events";
import { IOrganizationDto, IOrganizationUpdateDto }  from "../types/organization";
import mongoose, { Types } from 'mongoose';
import { emailRegex } from "../helpers/emailRegex";
import { parsePhoneNumberFromString } from 'libphonenumber-js';

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

export async function validateEmail(email: string) {
  if (!emailRegex.test(email))
    throw new Error("Invalid email format.");
}

export async function validatePhone(phone: string) {
  // Validate phone number
  try {
    const phoneNumber = parsePhoneNumberFromString(phone);
    if (!phoneNumber || !phoneNumber.isValid())
      throw new Error("Invalid phone number.");
  } catch (error) {
    throw new Error("Invalid phone number format.");
  }
}

export async function validateContactDetails(email: string, phone: string) {
  if (email)
    await validateEmail(email);
  if(phone) 
    await validatePhone(phone);
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

export async function verifyOrganization(orgId: string | Types.ObjectId) {
  return await Organization.findByIdAndUpdate(orgId, { isVerified: true }, { new: true }).exec();
}

export async function checkIfUserIsCreator(organization: IOrganization, userId: string) {
  return organization.createdBy.toString() === userId;
}

export async function findOrganizationById(id: string | Types.ObjectId) {
  const org = await Organization.findById(id).exec();
  if (!org) 
    throw new Error("Organization not found");
  return org;
}


export async function addFollowerCount(organization: any) {
  return {
    ...organization._doc,
    followerCount: organization.followers.length
  }
}

export async function addFollower(organization: any, userId: string) {
  if (organization.followers.some((id: any) => id.toString() === userId)) 
    organization.followers = organization.followers.filter((id: any) => id.toString() !== userId);
  else
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

export async function getOrganizations(query: Record<string, any>, page: number, limit: number) {
  const skip = (page - 1) * limit; 
  const organizations = await Organization.find(query).skip(skip).limit(limit);
  const organizationsWithFollowerCount = await Promise.all(
    organizations.map(addFollowerCount)
  );
  return organizationsWithFollowerCount;
}


export async function getOrganizationsByNameAndUserId(name: string, userId: string, minFollowerCount: number | undefined, createdBefore: Date | undefined, createdAfter: Date | undefined, sortOrder: string, page: number, limit: number) {
  const query: any = { createdBy: userId };
  if (name) query.name = { $regex: new RegExp(name, 'i') };
  if (minFollowerCount !== undefined) query.$expr = { $gte: [{ $size: "$followers" }, minFollowerCount] };
  if (createdAfter !== undefined || createdBefore !== undefined) {
    query.createdAt = {};
    if (createdAfter !== undefined)
      query.createdAt.$gte = new Date(createdAfter);
    if (createdBefore !== undefined)
      query.createdAt.$lt = new Date(createdBefore);
  }
  const sortOption = sortOrder === "newest" ? '-createdAt' : 'createdAt';
  const organizations = await Organization.find(query)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit);

  const organizationsWithFollowerCount = await Promise.all(
    organizations.map(addFollowerCount)
  );

  return organizationsWithFollowerCount;
}

export async function findAllOgranizationByCreatedId(userId: string) {
  return await Organization.find({ createdBy: userId });
}