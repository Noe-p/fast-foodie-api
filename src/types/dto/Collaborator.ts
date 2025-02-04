import { BaseDto } from './BaseDto';
import { UserDto } from './User';

export enum CollaboratorStatus {
  IS_PENDING = 'IS_PENDING',
  IS_ACCEPTED = 'IS_ACCEPTED',
}

export enum CollaboratorType {
  FULL_ACCESS = 'FULL_ACCESS',
  READ_ONLY = 'READ_ONLY',
}
export interface CollaboratorDto extends BaseDto {
  status: CollaboratorStatus;
  type: CollaboratorType;
  collaborator: UserDto;
  sender: UserDto;
}
