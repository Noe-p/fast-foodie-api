import { DishStatus } from '@/types/api/Dish';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Ingredient } from '../ingredient/Ingredient.entity';
import { Media } from '../media/media.entity';
import { User } from '../user/user.entity';

@Entity()
export class Dish extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  instructions: string;

  @Column({
    type: 'enum',
    enum: DishStatus,
    default: DishStatus.PUBLIC,
  })
  status: DishStatus;

  @Column({ default: false })
  weeklyDish: boolean;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ nullable: false, default: 2 })
  ration: number;

  @OneToMany(() => Media, (media) => media.dish, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  images?: Media[];

  @ManyToOne(() => User, (user) => user.dishes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  chef: User;

  @OneToMany(() => Ingredient, (ingredient) => ingredient.dish, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  ingredients: Ingredient[];
}
