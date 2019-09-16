const { checkSchema, validationResult } = require('express-validator/check');
const logger = require('../logger');
const errors = require('../errors');

// eslint-disable-next-line no-unused-vars
const checkValidationResult = (request, response, next) => {
  logger.info('Checking params');
  const errorsResult = validationResult(request);
  if (!errorsResult.isEmpty()) {
    return next(
      errors.field_validations_failed(errorsResult.array({ onlyFirstError: true }).map(e => e.msg))
    );
  }
  return next();
};

exports.validateSchema = schema => checkSchema(schema);

exports.validateSchemaAndFail = schema => [exports.validateSchema(schema), checkValidationResult];
