import {
  describe, expect, test,
} from 'bun:test';
import { ConsoleLogger } from 'rilata/src/common/logger/console-logger';
import { EventRepository } from './event-repo';
import { typeormDatabase } from './fixture';

describe('event repo tests', () => {
  test('', async () => {
    const eventRepo = new EventRepository(typeormDatabase, new ConsoleLogger());
    await eventRepo.init();
    console.log(await eventRepo.addEvent({
      attrs: {},
      meta: {
        eventId: crypto.randomUUID(),
        actionId: crypto.randomUUID(),
        name: 'nameeee',
        moduleName: 'subject',
        domainType: 'event',
      },
      caller: {
        type: 'DomainUser',
        userId: crypto.randomUUID(),
      },
      aRootAttrs: {
        attrs: undefined,
        meta: {
          name: '',
          domainType: 'aggregate',
          version: 0,
        },
      },
    }));
    expect(true).toBe(true);
  });
});
