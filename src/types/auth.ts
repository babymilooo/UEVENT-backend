import { IUserDto } from "./user";

export interface IRegisterDto extends IUserDto {}

export interface ILoginDto {
  email: string;
  password: string;
}
