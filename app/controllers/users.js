const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { serializeCreatedUser } = require('../serializers/users');
const { mapUserCreateRequest } = require('../mappers/user');

const logger = require('../../app/logger');
const userDb = require('../services/database/users');
const errors = require('../errors');
const { paramsValidationsErrors } = require('../constants/errorsMessages');

exports.createUser = (req, res, next) => {
  const newUserData = mapUserCreateRequest(req.body);

  return userDb
    .userNotExists(newUserData)
    .then(user => {
      if (user) {
        throw errors.field_validations_failed([paramsValidationsErrors.emailAlreadyExists]);
      }
      return userDb.createUser(newUserData);
    })
    .then(createdUser => {
      logger.info(`User ${createdUser.dataValues.firstName} was created.`);
      const serializedUser = serializeCreatedUser(createdUser);
      return res.status(201).send(serializedUser);
    })
    .catch(next);
};

exports.signIn = (req, res, next) =>
  // const userToSignIn = mapUserCreateRequest(req.body);
  userDb
    .userNotExists(req.body)
    .then(user => {
      if (!user) {
        throw errors.not_found_error();
      }
      if (bcrypt.compareSync(req.body.password, user.dataValues.password)) {
        logger.info(`User ${user.dataValues.firstName} logged with correct password. `);
        const token = jwt.sign({ id: user.dataValues.id }, process.env.SECRET); // sacar a hepler y usar config.common.seession.secret
        return res.status(200).send({ auth: true, token });
      }
      throw errors.field_validations_failed('Password not match');
    })
    .catch(next);
