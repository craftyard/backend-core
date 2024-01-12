import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { GeneralEventDod } from 'rilata/src/domain/domain-data/domain-types';
import { ModuleResolver } from 'rilata/src/app/resolves/module-resolver';
import { Database } from 'rilata/src/app/database/database';
import { Module } from 'rilata/src/app/module/module';
import { RunMode } from 'rilata/src/app/types';
import { Logger } from 'rilata/src/common/logger/logger';
import { Event } from './entities/event';
import { TypeormTestFixtures } from '../typeorm/fixture';
import { TypeormDatabase } from '../typeorm/database';

const dataSourceOptions: SqliteConnectionOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [Event],
};

export const typeormDatabase = new TypeormDatabase(
  dataSourceOptions,
  new TypeormTestFixtures.ResolverMock(),
);

export const eventDOD: GeneralEventDod = {
  attrs: {
    username: 'azat',
    age: 19,
  },
  meta: {
    eventId: 'd00103e8-eb18-4694-9efd-ce0b2dcbf0d7',
    actionId: 'c7ab5938-ac52-47d6-b831-62fbd3cbc288',
    name: 'UserAdded',
    moduleName: 'subject',
    domainType: 'event',
  },
  caller: {
    type: 'DomainUser',
    userId: '034e14d1-eabd-4491-b922-77b72f83590d',
  },
  aRootAttrs: {
    attrs: {
      username: 'azat',
      age: 19,
    },
    meta: {
      name: 'UserAR',
      domainType: 'aggregate',
      version: 0,
    },
  },
};

export class ModuleResolverMock implements ModuleResolver {
  init(module: Module): void {
    throw new Error('Method not implemented.');
  }

  getRunMode(): RunMode {
    throw new Error('Method not implemented.');
  }

  getModule(): Module {
    throw new Error('Method not implemented.');
  }

  getLogger(): Logger {
    throw new Error('Method not implemented.');
  }

  getRepository(...args: unknown[]): unknown {
    throw new Error('Method not implemented.');
  }

  getDatabase(): Database {
    throw new Error('Method not implemented.');
  }

  getRealisation(...args: unknown[]): unknown {
    throw new Error('Method not implemented.');
  }
}
