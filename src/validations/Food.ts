import { errorMessage } from '@/errors';
import { CreateFoodApi, UpdateFoodApi } from '@/types/api/Food';
import * as yup from 'yup';

const update: yup.ObjectSchema<UpdateFoodApi> = yup.object({
  name: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  aisle: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  icon: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
});

const create: yup.ObjectSchema<CreateFoodApi> = yup.object({
  name: yup
    .string()
    .required(errorMessage.fields('name').REQUIRED)
    .typeError(errorMessage.fields('name').NOT_STRING),
  aisle: yup
    .string()
    .required(errorMessage.fields('aisle').REQUIRED)
    .typeError(errorMessage.fields('aisle').NOT_STRING),
});

export const foodValidation = {
  update,
  create,
};
