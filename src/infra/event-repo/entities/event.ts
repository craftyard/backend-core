import {
  Entity, Column, PrimaryColumn,
} from 'typeorm';

@Entity()
export class Event {
  @PrimaryColumn()
    actionId!: string;

  @Column()
    isPublished!: boolean;

  @Column()
    attrs!: string;
}
