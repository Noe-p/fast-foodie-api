import { CreateDishApi, DishStatus, UpdateDishApi } from '@/types/api/Dish';
import * as yup from 'yup';
import { errorMessage } from '../errors';

const add: yup.ObjectSchema<CreateDishApi> = yup.object({
  name: yup
    .string()
    .required(errorMessage.fields('name').REQUIRED)
    .typeError(errorMessage.fields('name').NOT_STRING),
  tags: yup
    .array()
    .of(
      yup
        .string()
        .required(errorMessage.fields('tags').REQUIRED)
        .typeError(errorMessage.fields('tags').NOT_STRING),
    )
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  weeklyDish: yup
    .boolean()
    .required(errorMessage.fields('weeklyDish').REQUIRED)
    .transform((value) => (value === '' ? undefined : value))
    .default(false),
  ration: yup
    .number()
    .required(errorMessage.fields('ration').REQUIRED)
    .default(2),
  status: yup
    .string()
    .oneOf(Array.from(Object.values(DishStatus)))
    .required(errorMessage.fields('status').REQUIRED)
    .transform((value) => (value === '' ? undefined : value))
    .default(DishStatus.PUBLIC),
  favoriteImage: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  imageIds: yup
    .array()
    .of(
      yup
        .string()
        .required(errorMessage.fields('images').REQUIRED)
        .typeError(errorMessage.fields('images').NOT_STRING),
    )
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  instructions: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  ingredients: yup
    .array()
    .transform((value) => (value === '' ? undefined : value))
    .of(
      yup.object({
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
      }),
    )
    .required(errorMessage.fields('ingredients').REQUIRED)
    .typeError(errorMessage.fields('ingredients').NOT_ARRAY),
});

const update: yup.ObjectSchema<UpdateDishApi> = yup.object({
  name: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  ration: yup
    .number()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(2),
  instructions: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  favoriteImage: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  weeklyDish: yup
    .boolean()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(false),
  status: yup
    .string()
    .oneOf(Array.from(Object.values(DishStatus)))
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(DishStatus.PUBLIC),
  tags: yup
    .array()
    .of(
      yup
        .string()
        .required(errorMessage.fields('tags').REQUIRED)
        .typeError(errorMessage.fields('tags').NOT_STRING),
    )
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  imageIds: yup
    .array()
    .of(
      yup
        .string()
        .required(errorMessage.fields('images').REQUIRED)
        .typeError(errorMessage.fields('images').NOT_STRING),
    )
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  ingredients: yup
    .array()
    .of(
      yup.object({
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
      }),
    )
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
});

export const dishValidation = {
  add,
  update,
};
