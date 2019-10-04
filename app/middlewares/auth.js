const errors = require('../errors');
const errorMessages = require('../constants/errorsMessages');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const config = require('../../config');
const db = require('../models');
const { roles } = require('../constants/roles');
exports.authenticate = (req, res, next) => {
  let decoded = null;
  try {
    decoded = jwt.verify(req.headers.authorization, config.common.session.secret);
  } catch (err) {
    return next(errors.unauthorizedError(errorMessages.invalidToken));
  }
  return db.user
    .findOne({ where: { id: decoded.params.id } })
    .catch(err => {
      throw errors.databaseError(err.message);
    })
    .then(user => {
      if (!user) {
        next(errors.unauthorizedError(errorMessages.userNotFound));
      }
      // TODO: change to req.user = user
      req.user = user;
      logger.info(`User ${user.firstName} logged`);
      next();
    })
    .catch(next);
};

exports.authenticateAdmin = (req, res, next) => {
  if (req.user.role !== roles.admin) {
    return next(errors.unauthorizedError(errorMessages.notadminUser));
  }
  logger.info('User logged is admin');
  return next();
};
