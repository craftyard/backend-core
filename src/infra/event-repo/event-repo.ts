import { DomainEventRepository } from 'rilata/src/app/database/domain-event-repository';
import { GeneralEventDod } from 'rilata/src/domain/domain-data/domain-types';
import { Logger } from 'rilata/src/common/logger/logger';
import { storeDispatcher } from 'rilata/src/app/async-store/store-dispatcher';
import { Event } from './entities/event';
import { TypeormDatabase } from '../typeorm/database';

export class EventRepository implements DomainEventRepository {
  constructor(protected typeormDatabase: TypeormDatabase, protected logger: Logger) {}

  async addEvent(event: GeneralEventDod): Promise<void> {
    const { unitOfWorkId } = storeDispatcher.getThreadStore().getStore();
    const eventEntity = new Event();
    eventEntity.actionId = event.meta.actionId;
    eventEntity.attrs = JSON.stringify(event);
    eventEntity.isPublished = false;
    try {
      await this.typeormDatabase.getEntityManager(unitOfWorkId).save(eventEntity);
    } catch (e) {
      throw await this.logger.error('db server error by event repository', eventEntity);
    }
  }

  async isEventExist(actionId: string): Promise<boolean> {
    if (await this.typeormDatabase.createEntityManager().existsBy(Event, { actionId })) return true;
    return false;
  }

  async getNotPublishedEvents(): Promise<string[]> {
    return (await this.typeormDatabase
      .createEntityManager().find(Event, { where: { isPublished: false } }))
      .map((eventEnt) => eventEnt.attrs);
  }

  async markAsPublished(eventId: string): Promise<void> {
    try {
      await this.typeormDatabase.createEntityManager()
        .update(Event, { actionId: eventId }, { isPublished: true });
    } catch (e) {
      throw await this.logger.error('db server error by event repository', eventId);
    }
  }
}
