const errors = require('../errors');
const errorMessages = require('../constants/errorsMessages');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const config = require('../../config');
const db = require('../models');
exports.authenticate = (req, res, next) => {
  try {
    const decoded = jwt.verify(req.headers.authorization, config.common.session.secret);
    req.userId = decoded.params.id;
    logger.info('Valid token');
    next();
  } catch (err) {
    next(errors.unauthorizedError());
  }
};

exports.authenticateAdmin = (req, res, next) => {
  // TODO: See if ok calling here db or shold use service
  db.user
    .findOne({ where: { id: req.userId } })
    .then(user => (req.user = user))
    .then(() => (req.user.isAdmin ? next() : next(errors.unauthorizedError('Not admin'))))
    .catch(err => next(errors.databaseError(err)));
};
