const { serializeCreatedUser } = require('../serializers/users');
const { serializeToken } = require('../serializers/auth');
const { mapUserCreateRequest, mapUserSignIn } = require('../mappers/user');
const helpers = require('../helpers');
const logger = require('../../app/logger');
const userDb = require('../services/database/users');
const errors = require('../errors');

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
        throw errors.not_found_error();
      }
      if (helpers.passwordChecks(userToSignIn.password, user.password)) {
        logger.info(`User ${user.dataValues.firstName} logged with correct password.`);
        const token = helpers.createToken({ id: user.id });
        const serializedToken = serializeToken(token);
        return res.status(200).send(serializedToken);
      }
      logger.info('Invalid password');
      throw errors.unauthorized_error();
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  const pageSize = parseInt(req.query.pageSize);
  const offset = parseInt(req.query.page) * pageSize;
  const limit = pageSize;
  const attributes = ['id', 'email', 'first_name', 'last_name'];
  const params =
    limit && offset >= 0 ? { attributes, limit, offset, order: ['id'] } : { attributes, order: ['id'] };
  userDb
    .findAndCountAllUsersPaginated(params)
    .then(usersList => {
      res.send(usersList);
    })
    .catch(next);
};
