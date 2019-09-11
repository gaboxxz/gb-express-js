const { check, validationResult } = require('express-validator');

const db = require('../models');
const logger = require('../logger');
const errors = require('../errors');
exports.checks = [
  check('email')
    .isEmail()
    .custom(email => email.includes('@wolox'))
    .withMessage('Email must be wolox domain')
    .custom(async email => {
      // const user = ;
      if (await db.user.findOne({ where: { email } })) {
        throw errors.databaseError('User already exists.');
      }
    }),
  check('firstName').isLength({ min: 3 }),
  check('lastName').isLength({ min: 3 }),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be 8 characters long')
    .isAlphanumeric()
    .withMessage('Password must be alphanumeric')
];

exports.checksSignIn = [
  check('email')
    .isEmail()
    .custom(email => email.includes('@wolox'))
    .custom(async email => {
      const user = await db.user.findOne({ where: { email } });
      if (!user) {
        throw errors.not_found_error('Wrong Email or Password');
      }
    }),
  check('password')
    .isLength({ min: 8 })
    .isAlphanumeric()
];
exports.validateChecks = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    logger.error('User was not created. At least one field validation failed.');
    return res.status(422).json({ errors: errs.array() });
  }
  return next();
};

exports.validateChecksSignIn = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    logger.error('Field validations failed. Request was rejected');
    return next(errors.not_found_error('Wrong Email or Password'));
  }
  return next();
};
