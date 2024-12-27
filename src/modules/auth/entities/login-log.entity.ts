import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { Attendee } from 'src/modules/attendees/entities/attendee.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class LoginLog extends CustomBaseEntity {
  @ManyToOne(() => Attendee, (user) => user.loginLog, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  attendee: Attendee;

  @Column({ type: 'varchar', length: 30, nullable: true })
  ip: string;

  @Column()
  time: Date;
}
