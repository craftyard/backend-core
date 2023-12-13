import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ResultDTO } from 'rilata2/src/app/result-dto';
import { InvalidTokenError } from 'rilata2/src/app/jwt/errors';
import { dodUtility } from 'rilata2/src/common/utils/domain-object/dod-utility';
import { InvalidJWTTokenException } from './invalid-jwt-token-exception';

/**
 * Отфильтровывает InvalidJwtTokenException,
 * и возвращает сообщение ошибки как ответ HTTP запроса
 */
@Catch(InvalidJWTTokenException)
export class InvalidJWTTokenExceptionFilter implements ExceptionFilter {
  catch(exception: InvalidJWTTokenException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const rawToken = this.getJwtTokenFromHeaders(ctx.getRequest());

    const respBody: ResultDTO<InvalidTokenError, never> = {
      success: false,
      payload: dodUtility.getDomainErrorByType<InvalidTokenError>(
        'InvalidTokenError',
        'Невозможно расшифровать токен. Токен имеет не верный формат.',
        { rawToken },
      ),
    };

    response
      .status(HttpStatus.BAD_REQUEST)
      .json(respBody);
  }

  private getJwtTokenFromHeaders(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (!authHeader) return undefined;
    return authHeader.replace('Bearer ', '');
  }
}
