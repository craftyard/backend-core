/* eslint-disable max-classes-per-file */
import {
  afterEach, beforeEach, describe, expect, test,
} from 'bun:test';
import { TypeormTestFixtures as TestFixtures } from './fixture';

describe('тесты проверяющие работу транзакции бд typeorm', async () => {
  let globalUnitOfWorkId: string;
  const sut = new TestFixtures.TestDatabase();
  await sut.init();

  beforeEach(async () => {
    globalUnitOfWorkId = await sut.startTransaction();
  });

  afterEach(async () => {
    await sut.rollback(globalUnitOfWorkId);
    globalUnitOfWorkId = undefined;
  });

  describe('проверка работы вложенных транзакции', () => {
    test('успех, запись в одной таблице', async () => {
      const unitOfWorkId = await sut.startTransaction();
      const user = new TestFixtures.User();
      user.name = 'Alex'; user.age = 15;
      await sut.getEntityManager(unitOfWorkId).save(user);
      await sut.commit(unitOfWorkId);

      const expectUsers = await sut.createEntityManager().find(TestFixtures.User);
      expect(expectUsers.length).toBe(1);
      expect(expectUsers[0].name).toBe('Alex');
      expect(expectUsers[0].age).toBe(15);
    });

    test('успех, запись в двух таблицах', async () => {
      const unitOfWorkId = await sut.startTransaction();
      const entityManager = sut.getEntityManager(unitOfWorkId);

      const user = new TestFixtures.User();
      user.name = 'Alex'; user.age = 15;
      await entityManager.save(user);

      const event = new TestFixtures.Event();
      event.attrs = JSON.stringify({ name: 'Alex', age: 15 });
      await entityManager.save(event);

      await sut.commit(unitOfWorkId);

      const expectUsers = await sut.createEntityManager().find(TestFixtures.User);
      expect(expectUsers.length).toBe(1);
      expect(expectUsers[0].name).toBe('Alex');
      expect(expectUsers[0].age).toBe(15);

      const expectEvent = await sut.createEntityManager().find(TestFixtures.Event);
      expect(expectEvent.length).toBe(1);
      expect(typeof expectEvent[0].id).toBe('string');
      expect(expectEvent[0].attrs).toEqual(JSON.stringify({ name: 'Alex', age: 15 }));
    });

    test('провал, первый записался, второй вызвал исключение, в итоге ничего не записалось', async () => {
      const unitOfWorkId = await sut.startTransaction();
      const entityManager = sut.getEntityManager(unitOfWorkId);

      const user = new TestFixtures.User();
      user.name = 'Alex'; user.age = 15;
      await entityManager.save(user);

      const expectUsers = await sut.createEntityManager().find(TestFixtures.User);
      expect(expectUsers.length).toBe(1);

      const event = new TestFixtures.Event();
      try {
        await entityManager.save(event);
        expect(true).toBe(false);
      } catch (e) {
        await sut.rollback(unitOfWorkId);
        expect(String(e)).toBe(
          'QueryFailedError: SQLITE_CONSTRAINT: NOT NULL constraint failed: event.attrs',
        );
        expect(sut.errToExceptionDescription(e as Error)).toEqual({
          type: 'not null',
          table: 'event',
          column: 'attrs',
        });
      }

      const expectEmptyUsers = await sut.createEntityManager().find(TestFixtures.User);
      expect(expectEmptyUsers.length).toBe(0);

      const expectEvent = await sut.createEntityManager().find(TestFixtures.Event);
      expect(expectEvent.length).toBe(0);
    });
  });

  describe('проверка получения объектов ошибок', () => {
    test('ошибка нарушения уникальности поля', async () => {
      const unitOfWorkId = await sut.startTransaction();
      const entityManager = sut.getEntityManager(unitOfWorkId);

      const user = new TestFixtures.User();
      user.name = 'Alex'; user.age = 15;
      await entityManager.save(user);
      const user2 = new TestFixtures.User();
      user2.name = 'Bill'; user2.age = 15;
      try {
        await entityManager.save(user2);
        expect(true).toBe(false);
      } catch (e) {
        await sut.rollback(unitOfWorkId);
        expect(String(e)).toBe(
          'QueryFailedError: SQLITE_CONSTRAINT: UNIQUE constraint failed: user.age',
        );
        expect(sut.errToExceptionDescription(e as Error)).toEqual({
          type: 'unique',
          table: 'user',
          column: 'age',
        });
      }
    });
  });
});
