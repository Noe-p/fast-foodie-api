import { BaseDto } from './BaseDto';
import { FoodDto } from './Food';

export interface IngredientDto extends BaseDto {
  quantity: string;
  food: FoodDto;
}
