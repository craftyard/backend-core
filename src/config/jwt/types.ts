import { Algorithm } from 'jsonwebtoken';

export type JWTConfig = {
  algorithm: Algorithm,
  privateKey: string,
  publicKey: string,
  accessTokenExpiresIn: string,
  refreshTokenExpiresIn: string,
}
