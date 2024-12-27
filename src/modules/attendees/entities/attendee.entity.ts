import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { NumberTransformer } from 'src/config/custom-transformer.config';
import { LoginLog } from 'src/modules/auth/entities/login-log.entity';
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

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsString()
  password: string;

  @Column({ type: 'bool', nullable: false, default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', length: 10, nullable: true })
  code: string;

  @Column({
    type: 'numeric',
    nullable: true,
    transformer: new NumberTransformer(),
  })
  codeExpiredAt: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hash: string;

  @OneToMany(() => Registration, (registration) => registration.attendee, {
    cascade: true,
  })
  registrations: Registration[];

  @OneToMany(() => LoginLog, (loginLog) => loginLog.attendee, {
    cascade: true,
  })
  loginLog: LoginLog[];
}
