import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { extractTokens } from 'src/helpers/extractTokens.helper';

@Injectable()
export class TokenParserInterseptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = ctx.switchToHttp().getRequest();
    const tokens = extractTokens(request);

    request.tokens = tokens;

    return next.handle();
  }
}
