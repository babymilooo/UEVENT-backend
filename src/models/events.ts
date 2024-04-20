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
  stripeProductId?: string;
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
      type: Types.ObjectId,
      ref: "User",
    },
  ],
  //price in USD cents
  price: {
    type: Number,
    min: 50,
    required: true,
  },
  // TODO - create/update stripe product with event
  stripeProductId: {
    type: String,
  },
});

export const Event = model<ISchemaEvent>("Event", eventSchema);

export type IEvent = HydratedDocument<ISchemaEvent>;
