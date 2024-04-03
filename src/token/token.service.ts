import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  httponlyCookiesOption,
  jwtAccessConfig,
  jwtRefreshConfig,
} from 'src/config/auth';
import { ETokenType, IAuthTokens } from './interface/authTokens.interface';
import { Response } from 'express';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  getConfig(type: ETokenType) {
    switch (type) {
      case ETokenType.Access:
        return jwtAccessConfig;
      case ETokenType.Refresh:
        return jwtRefreshConfig;
      default:
        throw new Error(`Wrong token type`);
    }
  }

  async signToken(type: ETokenType, payload: any): Promise<string> {
    const config = this.getConfig(type);

    return this.jwtService.sign(payload, config);
  }

  async verifyToken(type: ETokenType, token: string) {
    const config = this.getConfig(type);

    return this.jwtService.verify(token, config);
  }

  async signAuthTokens(payload: any): Promise<IAuthTokens> {
    return {
      accessToken: await this.signToken(ETokenType.Access, payload),
      refreshToken: await this.signToken(ETokenType.Refresh, payload),
    };
  }

  async setAuthTokensToCookies(
    res: Response,
    tokens: IAuthTokens,
  ): Promise<boolean> {
    res.cookie('refreshToken', tokens.refreshToken, httponlyCookiesOption);
    res.cookie('accessToken', tokens.accessToken, httponlyCookiesOption);

    return true;
  }

  async deleteAuthTokensFromCookies(res: Response): Promise<boolean> {
    res.clearCookie('refreshToken', httponlyCookiesOption);
    res.clearCookie('accessToken', httponlyCookiesOption);

    return true;
  }
}
