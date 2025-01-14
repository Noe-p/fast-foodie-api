const fields = (item: string) => {
  return {
    REQUIRED: `fields:${item}.errors.required`,
    NOT_STRING: `fields:${item}.errors.notString`,
    TOO_SHORT: `fields:${item}.errors.tooShort`,
    NO_LETTER: `fields:${item}.errors.noLetter`,
    NO_DIGIT: `fields:${item}.errors.noDigit`,
    NO_SPECIAL_CHARACTER: `fields:${item}.errors.noSpecialCharacter`,
    HAS_SPACES: `fields:${item}.errors.hasSpaces`,
    NO_UPPERCASE: `fields:${item}.errors.noUppercase`,
    NOT_VALID: `fields:${item}.errors.notValid`,
    NOT_MATCH: `fields:${item}.errors.notMatch`,
    NOT_NUMBER: `fields:${item}.errors.notNumber`,
    NOT_URL: `fields:${item}.errors.notUrl`,
    NOT_ARRAY: `fields:${item}.errors.notArray`,
  };
};

const api = (item: string) => ({
  INTERNAL_SERVER_ERROR: `Internal server error on ${item}`,
  NOT_FOUND: `errors:api.${item}.notFound`,
  EXIST: `errors:api.${item}.exist`,
  NOT_ADMIN: `errors:api.${item}.notAdmin`,
  VALIDATION: `errors:api.${item}.error`,
  NOT_FOUND_OR_WRONG_PASSWORD: `errors:api.${item}.notFoundOrWrongPassword`,
  NOT_CREATED: `errors:api.${item}.notCreated`,
  CANNOT_CHANGE_OWN_STATUS: `errors:api.${item}.cannotChangeOwnStatus`,
  NOT_UPDATED: `errors:api.${item}.notUpdated`,
  INVALID_FORMAT: `errors:api.${item}.invalidFormat`,
  NOT_DELETED: `errors:api.${item}.notDeleted`,
  UNDEFINED: `errors:api.${item}.undefined`,
  ALREADY_CREATED: `errors:api.${item}.alreadyCreated`,
  ALREADY_DONE: `errors:api.${item}.alreadyDone`,
  INVALID: `errors:api.${item}.invalid`,
  NOT_ALLOWED: `errors:api.${item}.notAllowed`,
  EMAIL_REQUIRED: `errors:api.${item}.emailRequired`,
  ALREADY_ADDED: `errors:api.${item}.alreadyAdded`,
  NOT_URL: `errors:api.${item}.notUrl`,
});

const valid = (item: string) => ({
  ADDED_SUCCESS: `valid:api.${item}.addedSuccess`,
  UPDATED_SUCCESS: `valid:api.${item}.updatedSuccess`,
  DELETED_SUCCESS: `valid:api.${item}.deletedSuccess`,
  CHANGED_STATUS: `valid:api.${item}.changedStatus`,
  SUCCESS: `valid:api.${item}.success`,
});

export const errorMessage = {
  fields,
  api,
  valid,
};
