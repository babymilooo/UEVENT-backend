import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { extractTokens } from 'src/helpers/extractTokens.helper';
import { TokenService } from '../token/token.service';
import { ETokenType } from 'src/token/interface/authTokens.interface';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const tokens = extractTokens(request);

      const jwtData = await this.tokenService.verifyToken(
        ETokenType.Access,
        tokens.accessToken,
      );

      request.userId = jwtData.id;
      request.tokens = tokens;
      return true;
    } catch (error) {
      console.log('auth error - ', error.message);
      throw new UnauthorizedException(
        error.message || 'Session expired. Please refresh',
      );
    }
  }
}
