import { HydratedDocument, Schema, model } from "mongoose";

export interface ISchemaEvent {
  _id: string;
  createdBy: Schema.Types.ObjectId; 
  name: string; 
  description?: string; 
  date: Date; 
  website?: string; 
  isVerified: boolean; 
  attendees: Schema.Types.ObjectId[];
}

const eventSchema = new Schema<ISchemaEvent>({
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: "Organization", 
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
  date: { 
    type: Date, 
    required: true 
  },
  website: { 
    type: String, 
    default: "" 
  },
  isVerified: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
  attendees: [{ 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  }],
});

export const Event = model<ISchemaEvent>("Event", eventSchema);

export type IEvent = HydratedDocument<ISchemaEvent>;
