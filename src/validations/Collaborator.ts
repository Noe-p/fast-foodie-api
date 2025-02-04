import { errorMessage } from '@/errors';
import {
  CollaboratorType,
  CreateCollaboratorApi,
  UpdateCollaboratorApi,
} from 'src/types';
import * as yup from 'yup';

const create: yup.ObjectSchema<CreateCollaboratorApi> = yup.object({
  userName: yup
    .string()
    .required(errorMessage.fields('name').REQUIRED)
    .typeError(errorMessage.fields('name').NOT_STRING),
  type: yup
    .string()
    .oneOf(Array.from(Object.values(CollaboratorType)))
    .required(errorMessage.fields('status').REQUIRED)
    .transform((value) => (value === '' ? undefined : value))
    .default(CollaboratorType.READ_ONLY),
});

const update: yup.ObjectSchema<UpdateCollaboratorApi> = yup.object({
  type: yup
    .string()
    .oneOf(Array.from(Object.values(CollaboratorType)))
    .required(errorMessage.fields('status').REQUIRED)
    .transform((value) => (value === '' ? undefined : value)),
});

export const CollaboratorValidation = {
  create,
  update,
};
