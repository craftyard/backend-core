import {
  afterEach,
  beforeAll,
  describe,
  expect, test,
} from 'bun:test';
import { ConsoleLogger } from 'rilata/src/common/logger/console-logger';
import { EventRepository } from './event-repo';
import { eventDOD, typeormDatabase } from './fixture';
import { Event } from '../event-repo/entities/event';

let eventRepo: EventRepository;

beforeAll(async () => {
  await typeormDatabase.init();
  eventRepo = new EventRepository(typeormDatabase, new ConsoleLogger());
});

afterEach(async () => {
  typeormDatabase.createEntityManager().clear(Event);
});

describe('event repo test', () => {
  test('success, event entity added to the repo', async () => {
    await eventRepo.addEvent(eventDOD);
    const eventEntity = await typeormDatabase.createEntityManager()
      .findOne(Event, { where: { actionId: 'c7ab5938-ac52-47d6-b831-62fbd3cbc288' } });

    expect(eventEntity.actionId).toBe('c7ab5938-ac52-47d6-b831-62fbd3cbc288');
    expect(eventEntity.isPublished).toBe(false);
    expect(eventEntity.attrs).toBe('{"attrs":{"username":"azat","age":19},"meta":{"eventId":"d00103e8-eb18-4694-9efd-ce0b2dcbf0d7","actionId":"c7ab5938-ac52-47d6-b831-62fbd3cbc288","name":"nameeee","moduleName":"subject","domainType":"event"},'
    + '"caller":{"type":"DomainUser","userId":"034e14d1-eabd-4491-b922-77b72f83590d"},"aRootAttrs":{"attrs":{},"meta":{"name":"","domainType":"aggregate","version":0}}}');
  });

  test('success, event repo returned not published events', async () => {
    await eventRepo.addEvent(eventDOD);
    await eventRepo.addEvent({
      attrs: {
        username: 'azat',
        age: 19,
      },
      meta: {
        eventId: crypto.randomUUID(),
        actionId: 'c7ab5938-ac52-47d6-b645-625b73cb4266',
        name: 'kakoitoname',
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
    });
    await eventRepo.markAsPublished('c7ab5938-ac52-47d6-b645-625b73cb4266');

    expect(await eventRepo.getNotPublishedEvents()).toEqual([
      {
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
      },
    ]);
  });

  test('fail, not published events not found', async () => {
    expect(await eventRepo.getNotPublishedEvents()).toEqual([]);
  });

  test('success, event entity marked as published', async () => {
    await eventRepo.addEvent(eventDOD);
    await eventRepo.markAsPublished('c7ab5938-ac52-47d6-b831-62fbd3cbc288');

    expect((await typeormDatabase.createEntityManager()
      .findOne(Event, { where: { actionId: 'c7ab5938-ac52-47d6-b831-62fbd3cbc288' } })).isPublished).toBe(true);
  });
});
