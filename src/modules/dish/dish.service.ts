import { errorMessage } from '@/errors';
import { CreateDishApi, DishStatus, UpdateDishApi } from '@/types/api/Dish';
import { CreateIngredientApi } from '@/types/api/Ingredient';
import { DishDto } from '@/types/dto/Dish';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Raw, Repository } from 'typeorm';
import { CollaboratorService } from '../collaborator/collaborator.service';
import { Ingredient } from '../ingredient/Ingredient.entity';
import { Media } from '../media/media.entity';
import { MediaService } from '../media/media.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { IngredientService } from './../ingredient/ingredient.service';
import { Dish } from './Dish.entity';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish) private dishRepository: Repository<Dish>,
    private ingredientService: IngredientService,
    private mediaService: MediaService,
    private userService: UserService,
    private collaboratorService: CollaboratorService,
  ) {}

  formatDish(dish: Dish): DishDto {
    if (!dish) return;
    return {
      id: dish.id,
      name: dish.name,
      instructions: dish.instructions,
      ingredients:
        dish.ingredients?.map((ingredient) =>
          this.ingredientService.formatFood(ingredient),
        ) ?? [],
      status: dish.status,
      chef: this.userService.formatUser(dish.chef),
      tags: dish.tags,
      ration: dish.ration,
      images:
        dish.images?.map((image) => this.mediaService.formatMedia(image)) ?? [],
      favoriteImage: dish.favoriteImage,
      weeklyDish: dish.weeklyDish,
      updatedAt: dish.updatedAt,
      createdAt: dish.createdAt,
    };
  }

  async getDish(user: User): Promise<Dish[]> {
    try {
      if (!user)
        throw new BadRequestException(errorMessage.api('user').NOT_FOUND);

      // Récupérer les collaborateurs de l'utilisateur
      const sender = user.collaborators.map((collaborator) =>
        this.userService.formatUser(collaborator.sender),
      );

      const receiver = user.collabSend.map((collaborator) =>
        this.userService.formatUser(collaborator.receveid),
      );

      const collaborators = [...sender, ...receiver];

      // Inclure l'utilisateur et ses collaborateurs dans la recherche des dishes
      const userIds = [user.id, ...collaborators.map((c) => c.id)];

      // Récupérer les dishes qui sont soit de l'utilisateur, soit des collaborateurs, et dont le statut est 'PUBLIC'
      const dishes = await this.dishRepository.find({
        where: [
          { chef: { id: In(userIds) }, status: DishStatus.PUBLIC },
          { chef: { id: user.id } }, // Inclure tous les dishes de l'utilisateur
        ],
        relations: ['chef', 'ingredients', 'images', 'ingredients.food'],
      });

      return dishes;
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('dish').NOT_FOUND,
      });
    }
  }

  async getTags(user: User): Promise<string[]> {
    try {
      const dishes = await this.dishRepository.find({
        select: ['tags'],
        where: {
          chef: { id: user.id },
        },
      });
      return dishes.map((dish) => dish.tags).flat();
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('dish').NOT_FOUND,
      });
    }
  }

  async getOneById(_id: string): Promise<Dish> {
    try {
      const dish = await this.dishRepository.findOne({
        where: { id: _id },
        relations: ['chef', 'ingredients', 'images', 'ingredients.food'],
      });
      return { ...dish };
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('dish').NOT_FOUND,
      });
    }
  }

  async createDish(dish: CreateDishApi, user: User): Promise<Dish> {
    try {
      const {
        name,
        instructions,
        tags,
        status,
        weeklyDish,
        favoriteImage,
        ration,
      } = dish;

      let images: Media[];
      if (dish.imageIds && dish.imageIds.length > 0) {
        images = await Promise.all(
          dish.imageIds.map((imageId) =>
            this.mediaService.getMediaById(imageId),
          ),
        );
      }
      let ingredients: Ingredient[];
      if (dish.ingredients && dish.ingredients.length > 0) {
        ingredients = await Promise.all(
          dish.ingredients?.map((ingredient) =>
            this.ingredientService.createIngredient(ingredient),
          ),
        );
      }
      return await this.dishRepository.save({
        name,
        instructions,
        status,
        weeklyDish,
        ration,
        tags,
        chef: user,
        ingredients,
        images,
        favoriteImage,
      });
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('dish').NOT_CREATED,
      });
    }
  }

  async updateDish(data: UpdateDishApi, _id: string): Promise<Dish> {
    try {
      const { imageIds, ingredients, ...dishData } = data;

      const dish = await this.getOneById(_id);

      if (!dish)
        throw new BadRequestException({
          message: errorMessage.api('dish').NOT_FOUND,
        });

      let updatedIngredients: Ingredient[];
      if (ingredients) {
        // Suppression des ingrédients existants avant mise à jour
        await Promise.all(
          dish.ingredients.map((ingredient) =>
            this.ingredientService.deleteIngredient(ingredient.id),
          ),
        );

        updatedIngredients = await Promise.all(
          ingredients.map(async (ingredient: CreateIngredientApi) => {
            const food = await this.dishRepository.find({
              where: { id: ingredient.foodId },
            });

            if (!food) {
              throw new BadRequestException({
                message: errorMessage.api('ingredient').NOT_FOUND,
              });
            }
            return this.ingredientService.createIngredient({
              ...ingredient,
            });
          }),
        );
      }

      let images: Media[];
      if (imageIds) {
        const imagesToDelete = dish.images.filter(
          (image) => !imageIds.includes(image.id),
        );
        await Promise.all(
          imagesToDelete.map((image) =>
            this.mediaService.deleteMedia(image.id),
          ),
        );

        images = await Promise.all(
          imageIds.map((imageId) => this.mediaService.getMediaById(imageId)),
        );
      }

      await this.dishRepository.save({
        ...dish,
        ...dishData,
        images,
        ingredients: updatedIngredients ?? dish.ingredients,
      });
      return await this.getOneById(_id);
    } catch (error) {
      throw new BadRequestException({
        error,
        title: errorMessage.api('dish').NOT_UPDATED,
      });
    }
  }

  async removeTag(tag: string, user: User): Promise<void> {
    try {
      const dishes = await this.dishRepository.find({
        where: {
          chef: { id: user.id },
          tags: Raw((alias) => `:tag = ANY(${alias})`, { tag }),
        },
      });

      await Promise.all(
        dishes.map((dish) => {
          dish.tags = dish.tags.filter((t) => t !== tag);
          return this.dishRepository.save(dish);
        }),
      );
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('tag').NOT_DELETED,
      });
    }
  }

  async deleteDish(_id: string): Promise<void> {
    try {
      const dish = await this.getOneById(_id);
      if (dish.images) {
        await Promise.all(
          dish.images.map((image) => this.mediaService.deleteMedia(image.id)),
        );
      }
      await this.dishRepository.delete(_id);
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('dish').NOT_DELETED,
      });
    }
  }
}
