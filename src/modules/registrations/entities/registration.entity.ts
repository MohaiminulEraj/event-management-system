import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { NumberTransformer } from 'src/config/custom-transformer.config';
import { Attendee } from 'src/modules/attendees/entities/attendee.entity';
import { Event } from 'src/modules/events/entities/event.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Registration extends CustomBaseEntity {
  @Column({
    type: 'numeric',
    nullable: false,
    transformer: new NumberTransformer(),
  })
  registered_at: number;

  @ManyToOne(() => Event, (event) => event.registrations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  event: Event;

  @ManyToOne(() => Attendee, (attendee) => attendee.registrations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  attendee: Attendee;
}
