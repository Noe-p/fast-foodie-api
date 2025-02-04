import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Ingredient } from '../ingredient/Ingredient.entity';
import { User } from '../user/user.entity';

@Entity()
export class Food extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  aisle: string;

  @Column({ nullable: false })
  icon: string;

  @ManyToOne(() => User, (user) => user.foods, {
    eager: true,
    nullable: false,
  })
  user: User;

  @OneToMany(() => Ingredient, (ingredient) => ingredient.food, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  ingredients: Ingredient[];
}
