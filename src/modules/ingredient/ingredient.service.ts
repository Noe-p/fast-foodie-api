import { errorMessage } from '@/errors';
import {
  CreateIngredientApi,
  UpdateIngredientApi,
} from '@/types/api/Ingredient';
import { IngredientDto } from '@/types/dto/Ingredient';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodService } from '../food/food.service';
import { Ingredient } from './Ingredient.entity';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    private foodService: FoodService,
  ) {}

  formatFood(ingredient: Ingredient): IngredientDto {
    if (!ingredient) return;
    return {
      id: ingredient.id,
      quantity: ingredient.quantity,
      food: ingredient.food,
      updatedAt: ingredient.updatedAt,
      createdAt: ingredient.createdAt,
    };
  }

  async getOneById(_id: string): Promise<Ingredient> {
    try {
      const ingredient = await this.ingredientRepository.findOne({
        where: { id: _id },
      });
      return { ...ingredient };
    } catch (error) {
      throw new BadRequestException(errorMessage.api('ingredient').NOT_FOUND);
    }
  }

  async createIngredient(ingredient: CreateIngredientApi): Promise<Ingredient> {
    try {
      const food = await this.foodService.getOneById(ingredient.foodId);
      return await this.ingredientRepository.save({
        quantity: ingredient.quantity,
        food,
      });
    } catch (error) {
      throw new BadRequestException(errorMessage.api('ingredient').NOT_CREATED);
    }
  }

  async updateIngredient(
    _id: string,
    ingredient: UpdateIngredientApi,
  ): Promise<Ingredient> {
    try {
      await this.ingredientRepository.update(_id, ingredient);
      return await this.getOneById(_id);
    } catch (error) {
      throw new BadRequestException(errorMessage.api('ingredient').NOT_UPDATED);
    }
  }

  async deleteIngredient(_id: string): Promise<void> {
    try {
      await this.ingredientRepository.delete(_id);
    } catch (error) {
      throw new BadRequestException({
        ...error,
        message: errorMessage.api('ingredient').NOT_DELETED,
      });
    }
  }
}
