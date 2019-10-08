const errors = require('../errors'),
  logger = require('../logger');

const DEFAULT_STATUS_CODE = 500;

const statusCodes = {
  [errors.DATABASE_ERROR]: 503,
  [errors.DEFAULT_ERROR]: 500,
  [errors.EXTERNAL_API_ERROR]: 500,
  [errors.NOT_FOUND_ERROR]: 404,
  [errors.BAD_REQUEST_ERROR]: 400,
  [errors.VALIDATION_ERROR]: 400,
  [errors.UNAUTHORIZED_ERROR]: 401,
  [errors.EMAIL_REGISTERED_ERROR]: 400,
  [errors.USER_ALREADY_HAS_ALBUM]: 400
};

exports.handle = (error, req, res, next) => {
  if (error.internalCode) {
    res.status(statusCodes[error.internalCode] || DEFAULT_STATUS_CODE);
  } else {
    // Unrecognized error, notifying it to rollbar.
    logger.error('Unrecognized error');
    next(error);
    res.status(DEFAULT_STATUS_CODE);
  }
  return res.send({ message: error.message, internal_code: error.internalCode });
};
