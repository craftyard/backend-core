import { DomainEventRepository } from 'rilata/src/app/database/domain-event-repository';
import { GeneralEventDod } from 'rilata/src/domain/domain-data/domain-types';
import { Logger } from 'rilata/src/common/logger/logger';
import { storeDispatcher } from 'rilata/src/app/async-store/store-dispatcher';
import { Event } from './entities/event';
import { TypeormDatabase } from '../typeorm/database';

export class EventRepository implements DomainEventRepository {
  constructor(protected typeormDatabase: TypeormDatabase, protected logger: Logger) {}

  async addEvent(event: GeneralEventDod): Promise<void> {
    const findedEvent = await this.typeormDatabase.createEntityManager().findOne(
      Event,
      { where: { actionId: event.meta.actionId } },
    );
    if (findedEvent) { this.logger.error('event entity with that action id is already exist', event); }

    const eventEntity = new Event();
    eventEntity.actionId = event.meta.actionId;
    eventEntity.attrs = JSON.stringify(event);
    eventEntity.isPublished = false;

    const { unitOfWorkId } = storeDispatcher.getStoreOrExepction();
    if (!unitOfWorkId) {
      throw await this.logger.error('unit of work id isnt exist', unitOfWorkId);
    }
    try {
      await this.typeormDatabase.getEntityManager(unitOfWorkId).save(eventEntity);
    } catch (e) {
      throw await this.logger.error('db server error by event repository', eventEntity);
    }
  }

  async isEventExist(actionId: string): Promise<boolean> {
    return this.typeormDatabase.createEntityManager().existsBy(Event, { actionId });
  }

  async getNotPublishedEvents(): Promise<string[]> {
    return (await this.typeormDatabase
      .createEntityManager().find(Event, { where: { isPublished: false } }))
      .map((eventEnt) => eventEnt.attrs);
  }

  async markAsPublished(actionId: string): Promise<void> {
    try {
      await this.typeormDatabase.createEntityManager()
        .update(Event, { actionId }, { isPublished: true });
    } catch (e) {
      throw await this.logger.error('db server error by event repository', actionId);
    }
  }
}
