import { HydratedDocument, Schema, model } from "mongoose";
import { emailRegex } from "../helpers/emailRegex";

export interface ISchemaUser {
  _id: string;
  userName: string;
  email: string;
  emailVerified: boolean;
  passwordHash: string;
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
  },
  passwordHash: {
    type: String,
    required: true,
    trim: true,
  },
});

export const User = model<ISchemaUser>("User", userSchema);

export type IUser = HydratedDocument<ISchemaUser>;
