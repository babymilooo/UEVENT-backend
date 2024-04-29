import { ISchemaEvent } from "../models/events";

export interface IEventDto
  extends Omit<
    ISchemaEvent,
    "_id" | "followers" | "hidden" | "ticketOptions" | "picture" | "logo"
  > {
  hidden?: boolean;
}

export interface IEventUpdateDto extends Partial<IEventDto> {}
