import { errorMessage } from '@/errors';
import { RegisterApi, SearchParams, UpdateUserApi, UserDto } from '@/types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  formatUser(user: User): UserDto {
    if (!user) return;
    return {
      id: user.id,
      userName: user.userName ?? undefined,
      collaborators: user.collaborators ?? [],
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
        relations: ['collaborators'],
      };
      return await this.userRepository.find(conditions);
    } catch (error) {
      throw new BadRequestException(errorMessage.api('user').NOT_FOUND);
    }
  }

  async getOneById(_id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: _id },
        relations: ['collaborators'],
      });
      return { ...user };
    } catch (error) {
      throw new NotFoundException(errorMessage.api('user').NOT_FOUND, _id);
    }
  }

  async getOneByUsername(userName: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: [{ userName }],
      relations: ['collaborators'],
    });
    return user;
  }

  async createUser(body: RegisterApi): Promise<User> {
    try {
      return await this.userRepository.save({
        ...body,
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('user').NOT_CREATED);
    }
  }

  async updateUser(body: UpdateUserApi, id: string): Promise<User> {
    try {
      const user = await this.getOneById(id);
      if (!user)
        throw new BadRequestException(errorMessage.api('user').NOT_FOUND);

      // Vérifiez si collaborators est défini et si c'est un tableau
      if (!user.collaborators) {
        user.collaborators = [];
      }

      // Récupérer les collaborateurs (ils existent déjà dans la DB)
      const collaborators = await Promise.all(
        body.collaboratorIds.map(
          async (collaboratorId) => await this.getOneById(collaboratorId),
        ),
      );

      // Vérifier que les collaborateurs existent
      if (collaborators.includes(null)) {
        throw new BadRequestException('Some collaborators do not exist');
      }

      // Ajouter les collaborateurs
      user.collaborators = [...user.collaborators, ...collaborators];

      // Mettre à jour l'utilisateur
      user.userName = body.userName ?? user.userName;
      user.updatedAt = new Date();

      const userUpdated = await this.userRepository.save(user);
      return userUpdated;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.userRepository.delete(id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(errorMessage.api('user').NOT_FOUND, id);
    }
  }
}
