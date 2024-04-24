import { HydratedDocument, Schema, model, Types } from "mongoose";

export interface ISchemaEvent {
  _id: string;
  hidden: boolean;
  organizationId: Types.ObjectId;
  name: string;
  description?: string;
  date: Date;
  website?: string;
  attendees: Types.ObjectId[];
  price: number;
  ticketOptions: Types.ObjectId[];
  reminderSent: boolean;
  readonly isOver: boolean;
  location?: {
    latitude: string;
    longitude: string;
  };
}

const eventSchema = new Schema<ISchemaEvent>({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  hidden: {
    type: Boolean,
    required: true,
    default: false,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    required: true,
  },
  website: {
    type: String,
    default: "",
  },
  attendees: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  ticketOptions: [{
    type: Schema.Types.ObjectId,
    ref: "TicketOption"
  }],
  //price in USD cents
  price: {
    type: Number,
    min: 50,
    required: true,
  },
  reminderSent: {
    type: Boolean,
    required: true,
    default: false,
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
});

eventSchema.virtual("isOver").get(function () {
  return this.date >= new Date();
});

export const Event = model<ISchemaEvent>("Event", eventSchema);

export type IEvent = HydratedDocument<ISchemaEvent>;
