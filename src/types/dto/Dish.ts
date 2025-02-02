import { DishStatus } from '../api/Dish';
import { BaseDto } from './BaseDto';
import { IngredientDto } from './Ingredient';
import { MediaDto } from './Media';
import { UserDto } from './User';

export interface DishDto extends BaseDto {
  name: string;
  instructions?: string;
  ingredients: IngredientDto[];
  chef: UserDto;
  tags: string[];
  images: MediaDto[];
  weeklyDish: boolean;
  status: DishStatus;
  ration: number;
  favoriteImage?: string;
}
