/* eslint-disable no-return-assign */
import { Database } from 'rilata/src/app/database';
import { ModuleResolver } from 'rilata/src/app/resolves/module-resolver';
import { UuidType } from 'rilata/src/common/types';
import {
  DataSource, DataSourceOptions, EntityManager, QueryRunner,
  ReplicationMode,
} from 'typeorm';
import { storeDispatcher } from 'rilata/src/app/async-store/store-dispatcher';
import { TypeormExceptions } from './types';

const EXCEPTIONS_DESCRIPTIONS_TUPLE = [
  ['QueryFailedError: SQLITE_CONSTRAINT: NOT NULL', 'not null'],
  ['QueryFailedError: SQLITE_CONSTRAINT: UNIQUE', 'unique'],
] as const;

export class TypeormDatabase implements Database {
  dataSource!: DataSource;

  protected queryRunners: Map<UuidType, QueryRunner> = new Map();

  constructor(
    protected dataSourceOptions: DataSourceOptions,
    protected resolver: ModuleResolver,
  ) {}

  getUnitOfWorkId(): UuidType {
    const { unitOfWorkId } = storeDispatcher.getStoreOrExepction();
    if (unitOfWorkId === undefined) {
      throw this.resolver.getLogger().error(
        'Значение атрибута unitOfWorkId не установлена. Убедитесь что вы запрашиваете ее в рамках запроса контроллера.',
        { unitOfWorkId },
      );
    }
    return unitOfWorkId;
  }

  async init(): Promise<void> {
    this.dataSource = new DataSource(this.dataSourceOptions);
    await this.dataSource.initialize();
  }

  createEntityManager(): EntityManager {
    return this.dataSource.createEntityManager();
  }

  createQueryRunner(replicationMode?: ReplicationMode): QueryRunner {
    return this.dataSource.createQueryRunner(replicationMode);
  }

  getEntityManager(unitOfWorkId: string): EntityManager {
    const queryRunner = this.getQueryRunnerOrException(unitOfWorkId);
    return queryRunner.manager;
  }

  async startTransaction(unitOfWorkId?: UuidType): Promise<void> {
    const requiredUowId = unitOfWorkId ?? this.getUnitOfWorkId();
    if (this.queryRunners.get(requiredUowId) !== undefined) return;

    const queryRunner = this.createQueryRunner();
    await queryRunner.startTransaction();

    this.queryRunners.set(requiredUowId, queryRunner);
  }

  async commit(unitOfWorkId?: string): Promise<void> {
    const requiredUowId = unitOfWorkId ?? this.getUnitOfWorkId();
    const queryRunner = this.getQueryRunnerOrException(requiredUowId);
    try {
      await queryRunner.commitTransaction();
    } catch (e) {
      this.resolver.getLogger().error('Не удалось зафиксировать транзацкию БД.', e);
      throw e;
    } finally {
      queryRunner.release();
      this.queryRunners.delete(requiredUowId);
    }
  }

  async rollback(unitOfWorkId?: string): Promise<void> {
    const requiredUowId = unitOfWorkId ?? this.getUnitOfWorkId();
    const queryRunner = this.getQueryRunnerOrException(requiredUowId);
    try {
      await queryRunner.rollbackTransaction();
    } catch (e) {
      this.resolver.getLogger().error('Не удалось откатить транзацкию БД.', e);
      throw e;
    } finally {
      queryRunner.release();
      this.queryRunners.delete(requiredUowId);
    }
  }

  errToExceptionDescription(e: Error): TypeormExceptions | undefined {
    const errStr = String(e);
    const index = this.getExceptionDescriptionIndex(errStr);
    if (index === -1) return;

    // eslint-disable-next-line consistent-return
    return {
      type: EXCEPTIONS_DESCRIPTIONS_TUPLE[index][1],
      ...this.getTableAndAttrName(errStr),
    };
  }

  protected getExceptionDescriptionIndex(errStr: string): number {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return EXCEPTIONS_DESCRIPTIONS_TUPLE.findIndex(([desc, _]) => errStr.includes(desc));
  }

  protected getTableAndAttrName(errStr: string): { table: string, column: string } {
    const errArr = errStr.split(' ');
    const [table, column] = errArr[errArr.length - 1].split('.');
    return { table, column };
  }

  protected getQueryRunnerOrException(unitOfWorkId: string): QueryRunner {
    const queryRunner = this.queryRunners.get(unitOfWorkId);
    if (!queryRunner) {
      throw this.resolver.getLogger().error('not founded query runner');
    }
    return queryRunner;
  }
}
