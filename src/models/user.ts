import { HydratedDocument, Schema, model } from "mongoose";
import { emailRegex } from "../helpers/emailRegex";

export interface ISchemaUser {
  _id: string;
  userName: string;
  email: string;
  emailVerified: boolean;
  passwordHash?: string;
  isRegisteredViaSpotify?: boolean;
  spotifyRefreshToken?: string;
  role: string;
  profilePicture?: string;
  artists?: string[];
}

const userSchema = new Schema<ISchemaUser>({
  userName: {
    type: String,
    required: false,
    trim: true,
    default: "user",
  },
  email: {
    type: String,
    required() {
      return emailRegex.test(this.email);
    },
    trim: true,
    unique: true,
  },
  emailVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  passwordHash: {
    type: String,
    required: true,
    trim: true,
  },
  isRegisteredViaSpotify: {
    type: Boolean,
    required: false,
    default: false, 
  },
  spotifyRefreshToken: { 
    type: String,
    required: false,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "admin"], 
    default: "user", 
  },
  profilePicture: {
    type: String,
    required: false,
    trim: true,
  },
  artists: [{
    type: String,
    default: ""
  }],
});

export const User = model<ISchemaUser>("User", userSchema);

export type IUser = HydratedDocument<ISchemaUser>;
