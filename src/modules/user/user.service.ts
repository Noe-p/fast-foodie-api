import { errorMessage } from '@/errors';
import { RegisterApi, SearchParams, UpdateUserApi, UserDto } from '@/types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { CollaboratorService } from '../collaborator/collaborator.service';
import { MediaService } from '../media/media.service';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private mediaService: MediaService,
    private collaboratorService: CollaboratorService,
  ) {}

  formatUser(user: User): UserDto {
    if (!user) return;
    return {
      id: user.id,
      userName: user.userName ?? undefined,
      profilePicture: this.mediaService.formatMedia(user?.profilePicture),
      collaborators: user.collaborators?.map((collab) =>
        this.collaboratorService.formatCollaborators(collab),
      ),
      collabSend: user.collabSend?.map((collab) =>
        this.collaboratorService.formatCollaborators(collab),
      ),
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
    };
  }

  async getUsers(searchParams: SearchParams): Promise<User[]> {
    try {
      const order = {
        [searchParams.orderBy ?? 'createdAt']: searchParams.orderType ?? 'DESC',
      };
      const conditions: FindManyOptions<User> = {
        where: {
          userName: Raw(
            (alias) =>
              `LOWER(${alias}) Like '%${searchParams.search?.toLowerCase()}%'`,
          ),
        },
        order: {
          ...order,
        },
        skip: searchParams.page * searchParams.pageSize,
        take: searchParams.pageSize,
        relations: [
          'collaborators',
          'collaborators.sender',
          'collabSend',
          'collabSend.receveid',
        ],
      };
      return await this.userRepository.find(conditions);
    } catch (e) {
      throw new BadRequestException({
        ...e,
        title: errorMessage.api('user').NOT_FOUND,
      });
    }
  }

  async getOneById(_id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: _id },
        relations: [
          'collaborators',
          'collaborators.sender',
          'collabSend',
          'collabSend.receveid',
        ],
      });
      return { ...user };
    } catch (error) {
      throw new NotFoundException({
        ...error,
        title: errorMessage.api('user').NOT_FOUND,
        _id,
      });
    }
  }

  async getOneByUsername(userName: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: [{ userName }],
      relations: [
        'collaborators',
        'collaborators.sender',
        'collabSend',
        'collabSend.receveid',
      ],
    });
    return user;
  }

  async createUser(body: RegisterApi): Promise<User> {
    try {
      return await this.userRepository.save({
        ...body,
      });
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('user').NOT_CREATED,
      });
    }
  }

  async updateUser(body: UpdateUserApi, id: string): Promise<User> {
    try {
      const user = await this.getOneById(id);
      if (!user) {
        throw new BadRequestException({
          message: errorMessage.api('user').NOT_FOUND,
        });
      }

      const profilePictureMedia =
        body.profilePicture &&
        (await this.mediaService.getMediaById(body.profilePicture));

      user.userName = body.userName ?? user.userName;
      user.updatedAt = new Date();
      const userUpdated = await this.userRepository.save({
        ...user,
        profilePicture: profilePictureMedia ?? null,
      });

      if (profilePictureMedia && user.profilePicture) {
        await this.mediaService.deleteMedia(user.profilePicture.id);
      }

      // Retirer les informations circulaires avant de renvoyer la réponse
      return {
        ...userUpdated,
      };
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('user').NOT_UPDATED,
      });
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.userRepository.delete(id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('user').NOT_DELETED,
        id,
      });
    }
  }
}
