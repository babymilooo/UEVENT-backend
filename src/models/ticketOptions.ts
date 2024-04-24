import { HydratedDocument, Schema, Types, model } from "mongoose";

export interface ITicketOptionSchema {
  event: Types.ObjectId;
  name: string;
  price: number;
  description?: string;
  stripeProductId: string;
}

const ticketOptionSchema = new Schema<ITicketOptionSchema>({
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 50,
  },
  description: {
    type: String,
  },
  stripeProductId: {
    type: String,
    required: true,
  }
})

export const TicketOption = model<ITicketOptionSchema>('TicketOption', ticketOptionSchema);

export type ITicketOption = HydratedDocument<ITicketOptionSchema>;
