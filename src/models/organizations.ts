import { HydratedDocument, Schema, model, Types } from "mongoose";
import { emailRegex } from "../helpers/emailRegex";

export interface IShemaOrganization {
  _id: string;
  createdBy: Types.ObjectId;
  name: string; 
  email: string; 
  phone: string;
  description?: string;
  website?: string;
  location?: {
    latitude: string;
    longitude: string;
  };
  isVerified: boolean; 
  followers: Types.ObjectId[]; 
  picture?: string;
  logo?: string;
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
    trim: true,
    unique: true 
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
    latitude: {
      type: String,
      default: ""
    },
    longitude: {
      type: String,
      default: ""
    }
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
  picture : { 
    type: String, 
    default: ""
  },
  logo: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    required() {
      return emailRegex.test(this.email);
    },
    trim: true,
    unique: true,
  },
  phone: { 
    type: String,
    default: "",
    required: true 
  }
}, { timestamps: true });

export const Organization = model<IShemaOrganization>("Organization", organizationSchema);

export type IOrganization = HydratedDocument<IShemaOrganization>;

