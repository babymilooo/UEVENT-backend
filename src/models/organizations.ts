import { HydratedDocument, Schema, model, Types } from "mongoose";

export interface IShemaOrganization {
  _id: string;
  createdBy: Schema.Types.ObjectId;
  name: string; 
  description?: string;
  website?: string;
  location?: string;
  isVerified: boolean; 
  followers: Types.ObjectId[]; 
}

const organizationSchema = new Schema<IShemaOrganization>({
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    default: "" 
  },
  website: { 
    type: String, 
    default: "" 
  },
  location: { 
    type: String, 
    default: "" 
  },
  isVerified: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
  followers: [{ 
    type: Types.ObjectId, 
    ref: "User" 
  }],
});

export const Organization = model<IShemaOrganization>("Organization", organizationSchema);

export type IOrganization = HydratedDocument<IShemaOrganization>;

