/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable max-classes-per-file */
import {
  MigrationInterface, QueryRunner,
  Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Table,
} from 'typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { ModuleResolver } from 'rilata2/src/app/resolves/module-resolver';
import { Database } from 'rilata2/src/app/database/database';
import { TokenVerifier } from 'rilata2/src/app/jwt/token-verifier.interface';
import { Module } from 'rilata2/src/app/module/module';
import { Logger } from 'rilata2/src/common/logger/logger';
import { DTO } from 'rilata2/src/domain/dto';
import { ConsoleLogger } from 'rilata2/src/common/logger/console-logger';
import { TypeormDatabase } from './database';

export namespace TypeormTestFixtures {
  export class ResolverMock implements ModuleResolver {
    init(module: Module): void {
      throw new Error('Method not implemented.');
    }

    getTokenVerifier(): TokenVerifier<DTO> {
      throw new Error('Method not implemented.');
    }

    getModule(): Module {
      throw new Error('Method not implemented.');
    }

    getLogger(): Logger {
      return new ConsoleLogger();
    }

    getRepository(...args: unknown[]): unknown {
      throw new Error('Method not implemented.');
    }

    getDatabase(): Database {
      throw new Error('Method not implemented.');
    }
  }

  @Entity()
  export class User {
    @PrimaryColumn()
      name: string;

    @Column({ type: 'int', unique: true })
      age: number;
  }

  @Entity()
  export class Event {
    @PrimaryGeneratedColumn('uuid')
      id: string;

    @Column('simple-json')
      attrs: string;
  }

  const dataSourceOptions: SqliteConnectionOptions = {
    type: 'sqlite',
    database: ':memory:',
    entities: [User, Event],
  };

  class CreateTablesMigration implements MigrationInterface {
    name?: string;

    transaction?: boolean;

    async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
        new Table({
          name: 'user',
          columns: [
            {
              name: 'name',
              type: 'varchar',
              isPrimary: true,
            },
            {
              name: 'age',
              type: 'integer',
              isUnique: true,
            },
          ],
        }),
        true,
      );

      await queryRunner.createTable(
        new Table({
          name: 'event',
          columns: [
            {
              name: 'id',
              type: 'string',
              isPrimary: true,
            },
            {
              name: 'attrs',
              type: 'varchar',
            },
          ],
        }),
        true,
      );
    }

    down(queryRunner: QueryRunner): Promise<never> {
      throw new Error('Method not implemented.');
    }
  }

  export class TestDatabase extends TypeormDatabase {
    constructor() {
      super(dataSourceOptions, new ResolverMock());
    }

    async init(): Promise<void> {
      await super.init();
      const queryRunner = this.createQueryRunner();
      const migration = new CreateTablesMigration();
      await queryRunner.startTransaction();
      await migration.up(queryRunner);
      await queryRunner.commitTransaction();
      await queryRunner.release();
    }
  }
}
