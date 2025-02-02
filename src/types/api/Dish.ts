import { CreateIngredientApi, UpdateIngredientApi } from './Ingredient';

export enum DishStatus {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}
export interface CreateDishApi {
  name: string;
  instructions?: string;
  ingredients: CreateIngredientApi[];
  tags?: string[];
  imageIds?: string[];
  status: DishStatus;
  weeklyDish: boolean;
  ration: number;
  favoriteImage?: string;
}

export interface UpdateDishApi {
  name?: string;
  instructions?: string;
  ingredients?: UpdateIngredientApi[];
  tags?: string[];
  imageIds?: string[];
  status?: DishStatus;
  weeklyDish?: boolean;
  ration?: number;
  favoriteImage?: string;
}
