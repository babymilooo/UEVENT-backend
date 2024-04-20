import { ISchemaEvent } from "../models/events";

export interface IEventDto
  extends Omit<
    ISchemaEvent,
    "_id" | "attendees" | "stripeProductId" | "hidden"
  > {
  hidden?: boolean;
}

export interface IEventUpdateDto extends Partial<IEventDto> {}
