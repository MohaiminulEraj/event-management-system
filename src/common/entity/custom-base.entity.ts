import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Generated,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class CustomBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index({ unique: true })
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
