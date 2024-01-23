import {
  Entity, Column, PrimaryColumn,
} from 'typeorm';

@Entity()
export class Event {
  /*
  * PrimaryKey ставится actionDod потому, что есть вероятность,
  * что будет проверяться обрабатывался ли уже данный actionDod перед работой service
  */
  @PrimaryColumn()
    actionId!: string;

  @Column()
    isPublished!: boolean;

  @Column()
    attrs!: string;
}
