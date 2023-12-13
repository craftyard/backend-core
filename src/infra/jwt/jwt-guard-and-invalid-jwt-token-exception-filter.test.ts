import { test, expect, beforeAll } from 'bun:test';
import request from 'supertest';
import {
  Controller,
  Get,
  INestApplication,
  Req,
  UseFilters,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { dodUtility } from 'rilata2/src/common/utils/domain-object/dod-utility';
import { AnonymousUser, DomainUser } from 'rilata2/src/app/caller';
import { JWTConfig } from 'src/config/jwt/types';
import { InvalidTokenError } from 'rilata2/src/app/jwt/errors';
import { JWTAuthGuard } from './jwt-guard';
import { InvalidJWTTokenExceptionFilter } from './invalid-jwt-token-exception.filter';
import { AuthJWTManager } from './jsonwebtoken-lib.jwt.manager';

const testJWTPrivateKey = '-----BEGIN RSA PRIVATE KEY-----\n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\nWWE3QEECggEAHG9gm9aDfoJrlQvaZPlmLat5O6ZreR6cMCxcwKjj/qvd3IVwMHx5\nwrzKmFj6qXdkWbVXiofQG2WrM/FRDVLOWSuFMidB4Bitb0KlWsDRUI6CvMBSoWvd\nOxV0JzVDPtXrHubmCs/zKOhWqf229ymFrq3ETxdOJmEO8sDyAUwUTzRVBLmW9+Mz\n7WS/JuOTp9Ul/WQyPo9uPfU/dIcDn1lgCYK9f8hVWlGZe3y96NjwU/mHTZ8mWAG6\nENnlRXoBNtuWslWj4XCLva1sbN8Ts+TDO4DPXHnsIATao0dkS/mNm4y/1wr9WNq1\n3PywFi5e6Ahr5Gs9pdhfWnqOIO0WA6JHvQKCAQEArGE9fLxuRhZMmvTNTkphcgQ8\njIPSLUO2L2fWKdIBFz3c3lFO5c2OURXsrWe0LTMQfUfhI1I7Az9+hCCrKhqf33Vk\nfRZznk9iATyKK04Xj6MJTgT/U6DF1dx+In9vhapk+Vm715vi5zBgCSI9l5G0j1wX\nrpV2uvqlGg7ulp3lEdYM/Zyjlr1LVTxnraLLfLogDl/P6r1S0PKLEA8mfsjzvXS2\nvcdKMIIXqlkJNiUXVn9SOVvg+wqI1RFZ95O5Dzcg6XFWqIqKQNkdb9NbxKojHwtc\nmGltW3Rm9bf4cHWWRMsr8A8MONXz/5igaA+SMam0uM6yeECuuRuUtEwsnpE4sA==\n-----END RSA PRIVATE KEY-----\n';
const testJWTPublicKey = '-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAtHk29D/xTc+s9sLV2Sgt\ntR2BcoR6hm/juzPCnXJif7lgU6CClJaWNLZFz443DDlEZAzHBaHO9uDAFOXcU5/d\nTOfLoMnuA7G/CdCQf+xH/ASW9ctEcJQ8kaigj82B6gUppIHVu0ma5Sc5HyLRdsVj\ncNh9yoSOTD7AvgxEIVwRqCCFk6L/LuI89og11Xkcqa3PS5A8MkS661+Nm0doRBoc\nibM4Xj3m7VkiKDFG5yp/f7/hLxxnL9ARictz2nXZsnI5Xr3X0sTbhEOt9odgaDnt\n1BAZwHxbmXaICGBpRBQDyXTpycfibRdS+NQxdPnvXlNdi23QhbnOoi/cijjAqSqW\nv0Nf9jk+ulSvpbUDpEQK4s/NBd7XpzRxh5LDWYNF5Fz/+ecbABuF00F3raf45S+e\noUUz9Hdqhurl7b0T8JC46QxbZhI4WSVMEY2I1lGQic94qhcEDzeikoa9z5SCIXuj\nnQH9kKFH5tm8n3O0b9BJuLYp1DpBZhuYHkzn72jYEioOlTxTsl4m3/mS5tXhjfl3\nVff22GN+UnJUnBlieyZ4GhN/ExTvG6mFwM+JFs7cxtXXwZq1/zeNyS3L35IRihFb\n/dIJgPvkE+pfJzJiegG//hxH7U/i0KH2euVuKDzDGn/CN9nHVIu39D+Ht5N11jhW\nLcu1+ipwKUJdZj9mYxONvqUCAwEAAQ==\n-----END PUBLIC KEY-----\n';

const userId = '6c901af3-619c-4a45-9f27-0dfcb900e53c';
const employeeId = 'fbe91cc3-ff21-4b13-aff2-916d1b793ff5';

const jwtConfig: JWTConfig = {
  algorithm: 'RS512',
  privateKey: testJWTPrivateKey,
  publicKey: testJWTPublicKey,
  accessTokenExpiresIn: '10h',
  refreshTokenExpiresIn: '3d',
};

@Controller('')
class SomeController {
  @UseFilters(InvalidJWTTokenExceptionFilter)
  @Get()
  async get(@Req() req: { user: DomainUser }): Promise<void> {
    expect(req.user.type).toBe('DomainUser');
    expect(req.user.userId).toEqual(userId);
  }

  @UseFilters(InvalidJWTTokenExceptionFilter)
  @Get('2')
  async get2(@Req() req: { user: AnonymousUser }): Promise<void> {
    expect(req.user.type).toBe('AnonymousUser');
  }
}

let app: INestApplication;

const jwtManager = new AuthJWTManager(jwtConfig);

beforeAll(async () => {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [],
    controllers: [SomeController],
    providers: [
      {
        provide: AuthJWTManager,
        useValue: jwtManager,
      }],
  }).compile();

  app = moduleRef.createNestApplication();
  const jwtGuard = new JWTAuthGuard(jwtManager);
  app.useGlobalGuards(jwtGuard);
  await app.init();
});

test('Успешно', async () => {
  const token = jwtManager.createToken(
    {
      userId,
      employeeId,
    },
  );

  await request(app.getHttpServer())
    .get('/')
    .set('Authorization', `Bearer ${token.accessToken}`)
    .expect(200);
});

test('Анонимный пользователь', async () => {
  await request(app.getHttpServer())
    .get('/2')
    .expect(200);
});

function checkErr(errBody: Record<string, unknown>, rawToken: string): void {
  expect(errBody).toMatchObject(
    {
      success: false,
      payload: dodUtility.getDomainErrorByType<InvalidTokenError>(
        'InvalidTokenError',
        'Невозможно расшифровать токен. Токен имеет не верный формат.',
        { rawToken },
      ),
    },
  );
}

test('Ошибка. Передано refresh токен', async () => {
  const token = jwtManager.createToken({ userId, employeeId });

  const res = await request(app.getHttpServer())
    .get('/')
    .set('Authorization', `Bearer ${token.refreshToken}`)
    .expect(400);

  checkErr(res.body, token.refreshToken);
});

test('Ошибка. Передано ошибочный токен', async () => {
  const res = await request(app.getHttpServer())
    .get('/')
    .set('Authorization', 'Bearer 4534523452345')
    .expect(400);

  checkErr(res.body, '4534523452345');
});

test('Ошибка. Передано просроченный токен', async () => {
  jwtConfig.accessTokenExpiresIn = '1ms';
  const token = jwtManager.createToken(
    {
      userId,
      employeeId,
    },
  );

  const res = await request(app.getHttpServer())
    .get('/')
    .set('Authorization', `Bearer ${token.accessToken}`)
    .expect(400);

  checkErr(res.body, token.accessToken);
});

test('Ошибка. Передано токен с невалидным payload', async () => {
  const token = jwtManager.createToken(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore test failure
    {},
  );
  const res = await request(app.getHttpServer())
    .get('/')
    .set('Authorization', `Bearer ${token.accessToken}`)
    .expect(400);

  checkErr(res.body, token.accessToken);
});
