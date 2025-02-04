import { CollaboratorStatus, CollaboratorType } from '@/types';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../user/user.entity';

@Entity()
export class Collaborator extends BaseEntity {
  @ManyToOne(() => User, (user) => user.collaborators, {
    onDelete: 'CASCADE',
  })
  receveid: User;

  @ManyToOne(() => User, (user) => user.collaborators, {
    onDelete: 'CASCADE',
  })
  sender: User;

  @Column({
    type: 'enum',
    enum: CollaboratorType,
    default: CollaboratorType.READ_ONLY,
  })
  type: CollaboratorType;

  @Column({
    type: 'enum',
    enum: CollaboratorStatus,
    default: CollaboratorStatus.IS_PENDING,
  })
  status: CollaboratorStatus;
}
