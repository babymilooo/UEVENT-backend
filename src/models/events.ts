import { HydratedDocument, Schema, model, Types } from "mongoose";

export interface ISchemaEvent {
  _id: string;
  organizationId: Schema.Types.ObjectId; 
  name: string; 
  description?: string; 
  date: Date; 
  website?: string; 
  attendees: Types.ObjectId[];
}

const eventSchema = new Schema<ISchemaEvent>({
  organizationId: { 
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
  attendees: [{ 
    type: Types.ObjectId, 
    ref: "User" 
  }],
});

export const Event = model<ISchemaEvent>("Event", eventSchema);

export type IEvent = HydratedDocument<ISchemaEvent>;
