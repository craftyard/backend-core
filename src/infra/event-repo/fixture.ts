import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { GeneralEventDod } from 'rilata/src/domain/domain-data/domain-types';
import { TypeormDatabase } from '../typeorm/database';
import { TypeormTestFixtures } from '../typeorm/fixture';
import { Event } from './entities/event';

const dataSourceOptions: SqliteConnectionOptions = {
  type: 'sqlite',
  database: 'main.sqlite',
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
    name: 'nameeee',
    moduleName: 'subject',
    domainType: 'event',
  },
  caller: {
    type: 'DomainUser',
    userId: '034e14d1-eabd-4491-b922-77b72f83590d',
  },
  aRootAttrs: {
    attrs: {},
    meta: {
      name: '',
      domainType: 'aggregate',
      version: 0,
    },
  },
};
