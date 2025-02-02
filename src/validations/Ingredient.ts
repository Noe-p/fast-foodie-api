import {
  CreateIngredientApi,
  UpdateIngredientApi,
} from '@/types/api/Ingredient';
import * as yup from 'yup';
import { errorMessage } from '../errors';

const add: yup.ObjectSchema<CreateIngredientApi> = yup.object({
  foodId: yup
    .string()
    .required(errorMessage.fields('foodId').REQUIRED)
    .typeError(errorMessage.fields('foodId').NOT_STRING),
  quantity: yup
    .number()
    .required(errorMessage.fields('quantity').REQUIRED)
    .typeError(errorMessage.fields('quantity').NOT_STRING),
  unit: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
});

const update: yup.ObjectSchema<UpdateIngredientApi> = yup.object({
  foodId: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  quantity: yup
    .number()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  unit: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
});

export const ingredientValidation = {
  add,
  update,
};
