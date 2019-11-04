const errors = require('../errors');
const errorMessages = require('../constants/errorsMessages');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const config = require('../../config');
const db = require('../models');
const { roles } = require('../constants/roles');
const mappers = require('../mappers/user');
const constants = require('../constants');

exports.authenticate = (req, res, next) => {
  let decoded = null;
  try {
    decoded = jwt.verify(req.headers.authorization, config.common.session.secret);
  } catch (err) {
    return next(errors.unauthorizedError(err));
  }
  return db.user
    .findOne({ where: { id: decoded.params.id } })
    .then(user => {
      const tokenCreatedDate = new Date(decoded.params.created);
      if (tokenCreatedDate < user.sessionsValidFrom) {
        logger.error('session expired');
        next(errors.unauthorizedError(errorMessages.sessionExpired));
      }
      return user;
    })
    .catch(err => {
      throw errors.databaseError(err.message);
    })
    .then(user => {
      if (!user) {
        next(errors.unauthorizedError(errorMessages.userNotFound));
      }
      req.user = mappers.mapLoggedUser(user);
      logger.info(`User ${user.email} logged`);
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

exports.checkAccessToAlbums = (req, res, next) => {
  if (req.user.role === roles.admin) {
    logger.info('User is admin, can get acces to any user album list');
    return next();
  }
  if (parseInt(req.user.id) === parseInt(req.params.user_id)) {
    logger.info('User is requesting access to his own albums');
    return next();
  }
  logger.error('User is requesting access to other users albums and is not admin. Rejecting request');
  return next(errors.unauthorizedError(constants.notAdminToGetAlbums));
};
