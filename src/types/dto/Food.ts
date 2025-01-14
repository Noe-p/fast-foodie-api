import { BaseDto } from './BaseDto';

export interface FoodDto extends BaseDto {
  name: string;
  aisle: string;
  icon: string;
}
