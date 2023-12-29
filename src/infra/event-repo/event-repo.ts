import { DomainEventRepository } from 'node_modules/rilata/src/app/database/domain-event-repository';
import { GeneralEventDod } from 'rilata/src/domain/domain-data/domain-types';
import { Logger } from 'rilata/src/common/logger/logger';
import { EntityManager } from 'typeorm';
import { Event } from './entities/event';
import { TypeormDatabase } from '../typeorm/database';

export class EventRepository implements DomainEventRepository {
  protected entityManager: EntityManager;

  constructor(protected typeormDatabase: TypeormDatabase, protected logger: Logger) {
    this.init();
    this.entityManager = typeormDatabase.createEntityManager();
  }

  async init() {
    await this.typeormDatabase.init();
  }

  async addEvent(event: GeneralEventDod): Promise<void> {
    const eventEntity = new Event();
    eventEntity.actionId = event.meta.actionId;
    eventEntity.attrs = JSON.stringify(event.attrs);
    eventEntity.isPublished = false;
    try {
      const entityManager = this.typeormDatabase.createEntityManager();
      await entityManager.save(eventEntity);
    } catch (e) {
      this.logger.error('db server error', e);
    }
  }

  getNotPublishedEvents(): GeneralEventDod[] {
    throw new Error('Method not implemented.');
  }

  async markAsPublished(eventId: string): Promise<void> {
    try {
      await this.typeormDatabase.createEntityManager()
        .update(Event, { actionId: eventId }, { isPublished: true });
    } catch (e) {
      this.logger.error('db server error', e);
    }
  }
}
