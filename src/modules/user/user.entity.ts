import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
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

  // Relation entre un utilisateur et ses collaborateurs
  @OneToMany(() => User, (user) => user.manager)
  collaborators: User[];

  // Relation inverse pour le manager
  @ManyToOne(() => User, (user) => user.collaborators, { nullable: true })
  manager: User | null;

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
