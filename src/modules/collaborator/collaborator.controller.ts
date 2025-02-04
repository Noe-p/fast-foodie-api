import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { errorMessage } from '@/errors';
import {
  CollaboratorDto,
  CreateCollaboratorApi,
  UpdateCollaboratorApi,
} from '@/types';
import { CollaboratorValidation } from '@/validations';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../user/user.entity';
import { CollaboratorService } from './collaborator.service';

@Controller('collaborators')
export class CollaboratorController {
  constructor(
    @Inject(forwardRef(() => CollaboratorService))
    private service: CollaboratorService,
  ) {}

  @Post('sendAsk')
  @HttpCode(201)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async sendAsk(
    @GetCurrentUser() user: User,
    @Body() body: CreateCollaboratorApi,
  ): Promise<CollaboratorDto> {
    try {
      await CollaboratorValidation.create.validate(body, {
        abortEarly: false,
      });
      return this.service.formatCollaborators(
        await this.service.sendAsk(user, body),
      );
    } catch (e) {
      console.log('[D] collaborator.controller', e);
      throw new BadRequestException({
        ...e,
        errors: e.errors,
        title: errorMessage.api('collaborator').NOT_CREATED,
      });
    }
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async update(
    @Body() body: UpdateCollaboratorApi,
    @Param('id') id: string,
  ): Promise<CollaboratorDto> {
    try {
      await CollaboratorValidation.update.validate(body, {
        abortEarly: false,
      });
      const updatedColab = await this.service.updateType(id, body);
      return this.service.formatCollaborators(updatedColab);
    } catch (e) {
      console.log('[D] collaborator.controller', e);
      throw new BadRequestException({
        ...e,
        title: errorMessage.api('dish').NOT_UPDATED,
        errors: e.errors,
      });
    }
  }

  @Post('accept/:id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async accept(
    @GetCurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.accept(id);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async reject(@Param('id') id: string): Promise<void> {
    await this.service.delete(id);
  }
}
