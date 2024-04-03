import { IUserDto } from 'src/user/user.dto';

export class IRegisterDto extends IUserDto {}

export class ILoginDto {
  email: string;
  password: string;
}
