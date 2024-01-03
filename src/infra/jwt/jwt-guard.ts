import { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InvalidJWTTokenException } from './invalid-jwt-token-exception';
import { JWTManager } from '../../app/jwt/jwt-manager.interface';
import { RequestCY } from '../../app/jwt/types';

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
    const request: RequestCY = context.switchToHttp().getRequest();
    const token = this.getJwtTokenFromHeaders(request);
    if (!token) {
      request.user = {
        type: 'AnonymousUser',
      };
      return true;
    }
    const verifyResult = this.jwtManager.verifyToken(token, 'access');
    if (verifyResult.isFailure()) throw new InvalidJWTTokenException();

    request.user = {
      type: 'DomainUser',
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
