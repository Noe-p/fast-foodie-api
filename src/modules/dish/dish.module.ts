import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { FoodModule } from '../food/food.module';
import { IngredientModule } from '../ingredient/ingredient.module';
import { MediaModule } from '../media/media.module';
import { UserModule } from '../user/user.module';
import { DishController } from './dish.controller';
import { Dish } from './Dish.entity';
import { DishService } from './dish.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dish]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => FoodModule),
    forwardRef(() => MediaModule),
    forwardRef(() => IngredientModule),
  ],
  providers: [DishService],
  controllers: [DishController],
  exports: [DishService],
})
export class DishModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/dishes', method: RequestMethod.ALL },
        { path: '/dishes/*', method: RequestMethod.ALL },
      );
  }
}
