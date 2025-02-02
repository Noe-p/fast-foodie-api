import { BaseDto } from './BaseDto';
import { FoodDto } from './Food';

export interface IngredientDto extends BaseDto {
  quantity: number;
  food: FoodDto;
  unit?: string;
}
