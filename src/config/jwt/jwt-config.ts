import { AssertionException } from 'rilata/src/common/exeptions';
import { JWTConfig } from './types';

const getJwtPrivateKey = () => {
  const privateKey = process.env.JWT_PRIVATE_KEY;
  if (!privateKey) throw new AssertionException('not finded private jwt key');
  return privateKey;
};

const getJwtPublicKey = () => {
  const publicKey = process.env.JWT_PUBLIC_KEY;
  if (!publicKey) throw new AssertionException('not finded public jwt key');
  return publicKey;
};

export const jwtConfig: JWTConfig = {
  algorithm: 'RS512',
  privateKey: getJwtPrivateKey(),
  publicKey: getJwtPublicKey(),
  accessTokenExpiresIn: '99d',
  refreshTokenExpiresIn: '3d',
};
