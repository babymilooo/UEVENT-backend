import { HydratedDocument, Schema, Types, model } from "mongoose";

export interface ITicketOptionSchema {
  event: Types.ObjectId;
  name: string;
  price: number;
  description?: string;
  stripeProductId: string;
  quantity: number;
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
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  stripeProductId: {
    type: String,
    required: true,
  }
})

export const TicketOption = model<ITicketOptionSchema>('TicketOption', ticketOptionSchema);

export type ITicketOption = HydratedDocument<ITicketOptionSchema>;
