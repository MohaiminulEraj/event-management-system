import { Min } from 'class-validator';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { Registration } from 'src/modules/registrations/entities/registration.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Event extends CustomBaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  location: string;

  @Column({
    type: 'date',
    nullable: false,
  })
  date: Date;

  @Column({
    type: 'int',
    nullable: false,
  })
  @Min(1)
  max_attendees: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  createdById: string;

  @OneToMany(() => Registration, (registration) => registration.event, {
    cascade: true,
  })
  registrations: Registration[];
}
