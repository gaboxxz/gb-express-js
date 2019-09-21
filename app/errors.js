const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.DATABASE_ERROR = 'database_error';
exports.databaseError = message => internalError(message, exports.DATABASE_ERROR);

exports.DEFAULT_ERROR = 'default_error';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);

exports.EXTERNAL_API_ERROR = 'external_api_error';
exports.external_api_error = message => internalError(message, exports.EXTERNAL_API_ERROR);

exports.NOT_FOUND_ERROR = 'Not Found';
exports.not_found_error = message => internalError(message, exports.NOT_FOUND_ERROR);

exports.VALIDATION_ERROR = 'Field validations failed.';
exports.field_validations_failed = message => internalError(message, exports.VALIDATION_ERROR);

exports.BAD_REQUEST = 'Bad request.';
exports.bad_request = message => internalError(message, exports.BAD_REQUEST);

exports.UNAUTHORIZED_ERROR = 'Invalid Token. ';
exports.unauthorized_error = message => internalError(message, exports.UNAUTHORIZED_ERROR);
exports.EMAIL_REGISTERED_ERROR = 'Email already exists on database';
exports.email_registered_error = message => internalError(message, exports.EMAIL_REGISTERED_ERROR);
