import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Dish } from '../dish/Dish.entity';
import { Food } from '../food/Food.entity';

@Entity()
export class Ingredient extends BaseEntity {
  @Column({ nullable: false })
  quantity: number;

  @Column({ nullable: true })
  unit: string;

  @ManyToOne(() => Food, (food) => food.ingredients, {
    onDelete: 'CASCADE',
  })
  food: Food;

  @ManyToOne(() => Dish, (dish) => dish.ingredients, {
    onDelete: 'CASCADE',
  })
  dish: Dish;
}
