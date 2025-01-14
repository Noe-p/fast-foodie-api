import {
  CreateIngredientApi,
  UpdateIngredientApi,
} from '@/types/api/Ingredient';
import * as yup from 'yup';
import { errorMessage } from '../errors';

const add: yup.ObjectSchema<CreateIngredientApi> = yup.object({
  foodId: yup
    .string()
    .required(errorMessage.fields('id').REQUIRED)
    .typeError(errorMessage.fields('id').NOT_STRING),
  quantity: yup
    .string()
    .required(errorMessage.fields('quantity').REQUIRED)
    .typeError(errorMessage.fields('quantity').NOT_STRING),
});

const update: yup.ObjectSchema<UpdateIngredientApi> = yup.object({
  quantity: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  foodId: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
});

export const ingredientValidation = {
  add,
  update,
};
