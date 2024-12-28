import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { Registration } from 'src/modules/registrations/entities/registration.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Attendee extends CustomBaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  email: string;

  @OneToMany(() => Registration, (registration) => registration.attendee, {
    cascade: true,
  })
  registrations: Registration[];
}
