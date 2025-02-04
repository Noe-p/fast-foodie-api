import { errorMessage } from '@/errors';
import { CollaboratorType } from '@/types';
import { CreateFoodApi, UpdateFoodApi } from '@/types/api/Food';
import { FoodDto } from '@/types/dto/Food';
import { areSimilar, getFoodIcon } from '@/utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Food } from './Food.entity';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Food) private foodRepository: Repository<Food>,
  ) {}

  formatFood(food: Food): FoodDto {
    if (!food) return;
    return {
      id: food.id,
      name: food.name,
      aisle: food.aisle,
      icon: food.icon,
      updatedAt: food.updatedAt,
      createdAt: food.createdAt,
    };
  }

  async checkIfTheNameExist(
    name: string,
    user: User,
  ): Promise<Food | undefined> {
    try {
      const food = await this.foodRepository
        .createQueryBuilder('food')
        .where('LOWER(food.name) = LOWER(:name)', { name })
        .andWhere('food.user.id = :userId', { userId: user.id })
        .getOne();
      return food ?? undefined;
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('food').NOT_CREATED,
      });
    }
  }

  async getFood(user: User): Promise<Food[]> {
    try {
      if (!user)
        throw new BadRequestException(errorMessage.api('user').NOT_FOUND);

      // Récupérer tous les collaborateurs de l'utilisateur avec FULL_ACCESS
      const collaboratorsWithFullAccess = user.collaborators.filter(
        (collaborator) => collaborator.type === CollaboratorType.FULL_ACCESS,
      );

      // Récupérer les aliments de l'utilisateur
      const foods = await this.foodRepository.find({
        where: {
          user: { id: user.id },
        },
        relations: ['user'],
      });

      // Récupérer les aliments des collaborateurs en FULL_ACCESS
      const userOfCollaborators = collaboratorsWithFullAccess.map(
        (collaborator) => collaborator.sender,
      );

      const foodsOfCollaborators = await Promise.all(
        userOfCollaborators
          .flat()
          .filter((u) => u.id !== user.id)
          .map((u) =>
            this.foodRepository.find({
              where: { user: { id: u.id } },
              relations: ['user'],
            }),
          ),
      );

      const foodsOfCollabSender = await Promise.all(
        user.collabSend
          .filter((c) => c.type === CollaboratorType.FULL_ACCESS)
          .map((c) =>
            this.foodRepository.find({
              where: { user: { id: c.receveid.id } },
              relations: ['user'],
            }),
          ),
      );

      return [
        ...foods,
        ...foodsOfCollaborators.flat(),
        ...foodsOfCollabSender.flat(),
      ];
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('food').NOT_FOUND,
      });
    }
  }

  async getOneById(_id: string): Promise<Food> {
    try {
      const food = await this.foodRepository.findOne({
        where: { id: _id },
      });
      return food;
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('food').NOT_FOUND,
      });
    }
  }

  async createFood(food: CreateFoodApi, user: User): Promise<Food> {
    try {
      const existingFoods = await this.getFood(user);

      const isDuplicate = existingFoods.some((existingFood) =>
        areSimilar(existingFood.name, food.name),
      );

      if (isDuplicate) {
        throw new BadRequestException({
          message: errorMessage.api('food').IS_SIMILAR,
        });
      }
      const icon = getFoodIcon(food.name);
      return await this.foodRepository.save({
        ...food,
        icon,
        user,
      });
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('food').NOT_CREATED,
      });
    }
  }

  async updateFood(
    food: UpdateFoodApi,
    user: User,
    _id: string,
  ): Promise<Food> {
    try {
      if (food.name) await this.checkIfTheNameExist(food.name, user);
      await this.foodRepository.update(_id, {
        ...food,
        icon: getFoodIcon(food.name),
      });
      return await this.getOneById(_id);
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('food').NOT_UPDATED,
      });
    }
  }

  async deleteFood(_id: string): Promise<void> {
    try {
      await this.foodRepository.delete(_id);
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('food').NOT_DELETED,
      });
    }
  }
}
