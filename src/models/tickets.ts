import { HydratedDocument, Schema, model } from "mongoose";

interface ISchemaTicket {
  event: Schema.Types.ObjectId; 
  owner: Schema.Types.ObjectId; 
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
    required: true,
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
