import { HydratedDocument, Schema, model, Types } from "mongoose";
import { emailRegex } from "../helpers/emailRegex";

interface ISchemaTicket {
  event: Types.ObjectId; 
  owner?: Types.ObjectId; 
  ownerEmail: string;
  ownerName: string;
  price: number; 
  category: string;
  isUsed: boolean; 
}

const ticketSchema = new Schema<ISchemaTicket>({
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  ownerEmail: {
    type: String,
    required() {
      return emailRegex.test(this.ownerEmail);
    },
    trim: true,
  },
  ownerName: {
    type: String,
    requred: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  isUsed: {
    type: Boolean,
    required: true,
    default: false,
  }
});


export const Ticket = model<ISchemaTicket>("Ticket", ticketSchema);

export type ITicket = HydratedDocument<ISchemaTicket>;
