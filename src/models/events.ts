import { HydratedDocument, Schema, model, Types } from "mongoose";

export interface ISchemaEvent {
  _id: string;
  hidden: boolean;
  organizationId: Types.ObjectId;
  name: string;
  description?: string;
  date: Date;
  time: string;
  attendees: Types.ObjectId[];
  ticketOptions: Types.ObjectId[];
  reminderSent: boolean;
  readonly isOver: boolean;
  location?: {
    latitude: string;
    longitude: string;
  };
  picture?: string;
  logo?: string;
  artists?: string[],
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
  time: {
    type: String,
    required: true,
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  ticketOptions: [{
    type: Schema.Types.ObjectId,
    ref: "TicketOption"
  }],
  //price in USD cents

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
  picture: {
    type: String,
    default: ""
  },
  logo: {
    type: String,
    default: ""
  },
  artists: [{
    type: String,
    default: ""
  }],
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

eventSchema.virtual("isOver").get(function () {
  console.log(this.date, new Date());
  return this.date < new Date();
});

export const Event = model<ISchemaEvent>("Event", eventSchema);

export type IEvent = HydratedDocument<ISchemaEvent>;
