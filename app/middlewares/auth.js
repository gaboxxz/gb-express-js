const errors = require('../errors');
const errorMessages = require('../constants/errorsMessages');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const config = require('../../config');
const db = require('../models');
exports.authenticate = (req, res, next) => {
  let decoded = null;
  try {
    decoded = jwt.verify(req.headers.authorization, config.common.session.secret);
  } catch (err) {
    // TODO: messaage
    return next(errors.unauthorizedError('Invalid token'));
  }
  return db.user
    .findOne({ where: { id: decoded.params.id } })
    .catch(err => {
      throw errors.databaseError(err.message);
    })
    .then(user => {
      if (!user) {
        next(errors.unauthorizedError('User was not found on database'));
      }
      req.userId = user.id;
      req.userEmail = user.email;
      req.userIsAdmin = user.isAdmin;
      logger.info(`User ${user.firstName} logged`);
      next();
    })
    .catch(next);
};

exports.authenticateAdmin = (req, res, next) => {
  if (!req.userIsAdmin) {
    return next(errors.unauthorizedError(errorMessages.notadminUser));
  }
  logger.info('User logged is admin');
  return next();
};
