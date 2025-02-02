export interface CreateIngredientApi {
  quantity?: number;
  foodId?: string;
  unit?: string;
}

export interface UpdateIngredientApi {
  foodId?: string;
  quantity?: number;
  unit?: string;
}
