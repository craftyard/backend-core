import { Realisable } from 'rilata/src/app/resolves/realisable';
import { JWTDecoder } from 'rilata/src/app/jwt/jwt-decoder.interface';
import { TokenCreator } from 'rilata/src/app/jwt/token-creator.interface';
import { TokenVerifier } from 'rilata/src/app/jwt/token-verifier.interface';
import { JWTPayload } from 'cy-domain/src/subject/domain-data/user/user-authentification/a-params';

export interface JWTManager
extends JWTDecoder<JWTPayload>, TokenVerifier<JWTPayload>, TokenCreator<JWTPayload> {}

export const JWTManager = {
  instance(resolver: Realisable): JWTManager {
    return resolver.getRealisation(JWTManager) as JWTManager;
  },
};
