import { Types } from "mongoose";

export interface ITicketOptionDto {
  event: Types.ObjectId | string;
  name: string;
  price: number;
  description?: string;
  quantity: number;
}

export interface ITicketOptionUpdateDto extends Omit<Partial<ITicketOptionDto>, 'event'> {}
