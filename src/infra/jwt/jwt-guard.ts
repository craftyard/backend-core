import { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { uuidUtility } from 'rilata2/src/common/utils/uuid/uuid-utility';
import { JWTManager } from 'src/app/jwt/jwt-manager.interface';
import { HTTPRequest } from 'src/app/jwt/types';
import { InvalidJWTTokenException } from './invalid-jwt-token-exception';

/**
 * Получает токен из заголовок HTTP запроса,
 * и из токена берет пользователя, потом подкрепляет user в объект request.
 * Если ошибка в токене, испускает InvalidJwtTokenException
 */
@Injectable()
export class JWTAuthGuard implements CanActivate {
  private jwtManager: JWTManager;

  constructor(jwtManager: JWTManager) {
    this.jwtManager = jwtManager;
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request: HTTPRequest = context.switchToHttp().getRequest();
    const token = this.getJwtTokenFromHeaders(request);
    if (!token) {
      request.user = {
        type: 'AnonymousUser',
        requestID: uuidUtility.getNewUUID(),
      };
      return true;
    }
    const verifyResult = await this.jwtManager.verifyToken(token, 'access');
    if (verifyResult.isFailure()) throw new InvalidJWTTokenException();

    request.user = {
      type: 'DomainUser',
      requestID: uuidUtility.getNewUUID(),
      userId: verifyResult.value.userId,
    };

    return true;
  }

  private getJwtTokenFromHeaders(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (!authHeader) return undefined;
    return authHeader.replace('Bearer ', '');
  }
}
