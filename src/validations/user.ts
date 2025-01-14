import { errorMessage } from '@/errors';
import { AuthLoginApi, RegisterApi, UpdateUserApi } from '@/types/api';
import * as yup from 'yup';
import { genericsValidation } from './generics';

const update: yup.ObjectSchema<UpdateUserApi> = yup.object({
  userName: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  collaboratorIds: yup
    .array()
    .of(yup.string())
    .transform((value) => (value === '' ? undefined : value))
    .default([]),
});

const create: yup.ObjectSchema<RegisterApi> = yup.object({
  password: genericsValidation.password.required(
    errorMessage.fields('password').REQUIRED,
  ),
  userName: yup
    .string()
    .required(errorMessage.fields('userName').REQUIRED)
    .typeError(errorMessage.fields('userName').NOT_STRING),
});

const login = yup.object<AuthLoginApi>().shape({
  login: yup
    .string()
    .required(errorMessage.fields('login').REQUIRED)
    .typeError(errorMessage.fields('login').NOT_STRING),
  password: genericsValidation.password.required(
    errorMessage.fields('password').REQUIRED,
  ),
});

export const userValidation = {
  update,
  create,
  login,
};
