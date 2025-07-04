import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { CollaboratorModule } from '../collaborator/collaborator.module';
import { DishModule } from '../dish/dish.module';
import { FoodModule } from '../food/food.module';
import { MediaModule } from '../media/media.module';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => FoodModule),
    forwardRef(() => DishModule),
    forwardRef(() => MediaModule),
    forwardRef(() => CollaboratorModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/users', method: RequestMethod.ALL },
        { path: '/users/*', method: RequestMethod.ALL },
      );
  }
}
