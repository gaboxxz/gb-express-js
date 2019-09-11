// const db = require('../models');
// const logger = require('../logger');
const errors = require('../errors');
const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  try {
    req.user = jwt.verify(req.headers.authorization, process.env.SECRET);
    next();
  } catch (err) {
    next(errors.not_found_error('Invalid token'));
  }
};
