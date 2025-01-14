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
import { FileUploadModule } from '../file-upload/file-upload.module';
import { UserModule } from '../user/user.module';
import { Media } from './media.entity';
import { MediaService } from './media.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => FileUploadModule),
    forwardRef(() => DishModule),
  ],
  providers: [MediaService],
  controllers: [],
  exports: [TypeOrmModule, MediaService],
})
export class MediaModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/media', method: RequestMethod.DELETE },
        { path: '/media', method: RequestMethod.PATCH },
        { path: '/media', method: RequestMethod.POST },
        { path: '/media/*', method: RequestMethod.DELETE },
        { path: '/media/*', method: RequestMethod.PATCH },
        { path: '/media/*', method: RequestMethod.POST },
      );
  }
}
