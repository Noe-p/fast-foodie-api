import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { DishModule } from '../dish/dish.module';
import { FoodModule } from '../food/food.module';
import { UserModule } from '../user/user.module';
import { Ingredient } from './Ingredient.entity';
import { IngredientService } from './ingredient.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ingredient]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => FoodModule),
    forwardRef(() => DishModule),
  ],
  providers: [IngredientService],
  controllers: [],
  exports: [IngredientService],
})
export class IngredientModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/ingredients', method: RequestMethod.ALL },
        { path: '/ingredients/*', method: RequestMethod.ALL },
      );
  }
}
