import { DomainEventRepository } from 'rilata/src/app/database/domain-event-repository';
import { GeneralEventDod } from 'rilata/src/domain/domain-data/domain-types';
import { Logger } from 'rilata/src/common/logger/logger';
import { EntityManager } from 'typeorm';
import { Event } from './entities/event';
import { TypeormDatabase } from '../typeorm/database';

export class EventRepository implements DomainEventRepository {
  protected entityManager: EntityManager;

  constructor(protected typeormDatabase: TypeormDatabase, protected logger: Logger) {
    this.entityManager = typeormDatabase.createEntityManager();
  }

  async addEvent(event: GeneralEventDod): Promise<void> {
    const eventEntity = new Event();
    eventEntity.actionId = event.meta.actionId;
    eventEntity.attrs = JSON.stringify(event);
    eventEntity.isPublished = false;
    try {
      await this.entityManager.save(eventEntity);
    } catch (e) {
      throw await this.logger.error('db server error', e);
    }
  }

  async getNotPublishedEvents(): Promise<GeneralEventDod[]> {
    return (await this.entityManager.find(Event, { where: { isPublished: false } }))
      .map((eventEnt) => JSON.parse(eventEnt.attrs));
  }

  async markAsPublished(eventId: string): Promise<void> {
    try {
      await this.entityManager
        .update(Event, { actionId: eventId }, { isPublished: true });
    } catch (e) {
      throw await this.logger.error('db server error', e);
    }
  }
}
