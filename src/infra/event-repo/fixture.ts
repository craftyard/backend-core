import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { TypeormDatabase } from '../typeorm/database';
import { TypeormTestFixtures } from '../typeorm/fixture';
import { Event } from '../event-repo/entities/event';

const dataSourceOptions: SqliteConnectionOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [Event],
};

export const typeormDatabase = new TypeormDatabase(
  dataSourceOptions,
  new TypeormTestFixtures.ResolverMock(),
);
