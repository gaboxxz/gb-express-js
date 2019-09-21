// const db = require('../models');
// const logger = require('../logger');
const errors = require('../errors');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const config = require('../../config');
exports.authenticate = (req, res, next) => {
  try {
    const decoded = jwt.verify(req.headers.authorization, config.common.session.secret);
    req.userId = decoded.params.id;
    logger.info('Valid token');
    next();
  } catch (err) {
    next(errors.unauthorized_error());
  }
};
