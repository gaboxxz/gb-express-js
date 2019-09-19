const { serializeCreatedUser } = require('../serializers/users');
const { serializeToken } = require('../serializers/auth');
const { mapUserCreateRequest, mapUserSignIn } = require('../mappers/user');
const helpers = require('../helpers');
const logger = require('../../app/logger');
const userDb = require('../services/database/users');
const errors = require('../errors');
const { paramsValidationsErrors } = require('../constants/errorsMessages');

exports.createUser = (req, res, next) => {
  const newUserData = mapUserCreateRequest(req.body);

  return userDb
    .findUserByEmail(newUserData)
    .then(user => {
      if (user) {
        throw errors.email_registered_error();
      }
      return userDb.createUser(newUserData);
    })
    .then(createdUser => {
      logger.info(`User ${createdUser.firstName} was created.`);
      const serializedUser = serializeCreatedUser(createdUser);
      return res.status(201).send(serializedUser);
    })
    .catch(next);
};

exports.signIn = (req, res, next) => {
  const userToSignIn = mapUserSignIn(req.body);
  userDb
    .findUserByEmail(userToSignIn)
    .then(user => {
      if (!user) {
        throw errors.not_found_error(paramsValidationsErrors.notFoundEmail);
      }
      if (helpers.passwordChecks(userToSignIn.password, user.password)) {
        logger.info(`User ${user.dataValues.firstName} logged with correct password.`);
        const token = helpers.createToken({ id: user.id });
        const serializedToken = serializeToken(token);
        return res.status(200).send(serializedToken);
      }
      throw errors.unauthorized_error();
    })
    .catch(next);
};
