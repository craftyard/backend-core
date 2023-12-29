import { UuidType } from 'rilata/src/common/types';
import {
  Entity, PrimaryGeneratedColumn, Column, PrimaryColumn,
} from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
  @PrimaryColumn()
    actionId: UuidType;

  @Column()
    isPublished: boolean;

  @Column()
    attrs: string;
}
