import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import { Response } from 'express';
import { TokenGuard } from 'src/guards/token.guard';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { ILoginDto, IRegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  @Post('login')
  async login(
    @Body() loginInfo: ILoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const email = loginInfo.email;
    const user = await this.userService.findByEmail(email);

    if (!user) throw new NotFoundException('User with this email not found');

    if (!bcrypt.compareSync(loginInfo.password, user.passwordHash))
      throw new ForbiddenException('Invalid password');

    const tokenPayload = {
      id: user._id,
      timestamp: new Date().toISOString(),
    };

    const tokens = await this.tokenService.signAuthTokens(tokenPayload);
    await this.tokenService.setAuthTokensToCookies(res, tokens);

    const returnObj = user.toObject();
    delete returnObj.passwordHash;
    return returnObj;
  }

  @UseGuards(TokenGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.tokenService.deleteAuthTokensFromCookies(res);
    return 'Logout Success';
  }

  @Post('register')
  async register(@Body() registerInfo: IRegisterDto) {
    await this.userService.createUser(registerInfo);
    return 'User successfully created';
  }

  @Post('refreshToken')
  async refreshToken() {}
}
