import { CreateCollaboratorApi, UpdateCollaboratorApi } from 'src/types';
import * as yup from 'yup';

const create: yup.ObjectSchema<CreateCollaboratorApi> = yup.object({});

const update: yup.ObjectSchema<UpdateCollaboratorApi> = yup.object({});

export const CollaboratorValidation = {
  create,
  update,
};
