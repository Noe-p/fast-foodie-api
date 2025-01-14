export interface CreateIngredientApi {
  quantity?: string;
  foodId?: string;
}

export interface UpdateIngredientApi {
  foodId?: string;
  quantity?: string;
}
