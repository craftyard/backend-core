import { JWTConfig } from './types';

export const jwtConfig: JWTConfig = {
  algorithm: 'RS512',
  privateKey: process.env.JWT_PRIVATE_KEY,
  publicKey: process.env.JWT_PUBLIC_KEY,
  accessTokenExpiresIn: '10h',
  refreshTokenExpiresIn: '3d',
};
