import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Collaborator } from '../collaborator/Collaborator.entity';
import { Dish } from '../dish/Dish.entity';
import { Food } from '../food/Food.entity';
import { Media } from '../media/media.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ nullable: false })
  userName: string;

  @Column({ nullable: false })
  password: string;

  @OneToOne(() => Media, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  profilePicture: Media;

  @OneToMany(() => Collaborator, (collab) => collab.receveid, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  collaborators: Collaborator[];

  @OneToMany(() => Collaborator, (collab) => collab.sender, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  collabSend: Collaborator[];

  @OneToMany(() => Food, (food) => food.user, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  foods: Food[];

  @OneToMany(() => Food, (food) => food.user, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  dishes: Dish[];
}
