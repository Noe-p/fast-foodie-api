import { Column, Entity, ManyToOne } from 'typeorm';
import { MediaType } from '../../types';
import { BaseEntity } from '../base.entity';
import { Dish } from '../dish/Dish.entity';

@Entity()
export class Media extends BaseEntity {
  @Column()
  url: string;

  @Column({ nullable: false, default: '' })
  localPath: string;

  @Column({ nullable: false, default: '' })
  filename: string;

  @Column()
  type: MediaType;

  @Column()
  size: number;

  @ManyToOne(() => Dish, (dish) => dish.images, {
    onDelete: 'CASCADE',
  })
  dish: Dish;
}
