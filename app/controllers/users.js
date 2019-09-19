const bcrypt = require('bcrypt');

const { serializeCreatedUser } = require('../serializers/users');
const { mapUserCreateRequest, mapUserSignIn } = require('../mappers/user');
const helpers = require('../helpers');
const logger = require('../../app/logger');
const userDb = require('../services/database/users');
const errors = require('../errors');
const { emailAlreadyExists, paramsValidationsErrors } = require('../constants/errorsMessages');

exports.createUser = (req, res, next) => {
  const newUserData = mapUserCreateRequest(req.body);

  return userDb
    .findUser(newUserData)
    .then(user => {
      if (user) {
        throw errors.field_validations_failed([emailAlreadyExists]);
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
    .findUser(userToSignIn)
    .then(user => {
      if (!user) {
        throw errors.not_found_error(paramsValidationsErrors.notFoundEmail);
      }
      if (bcrypt.compareSync(req.body.password, user.dataValues.password)) {
        logger.info(`User ${user.dataValues.firstName} logged with correct password.`);
        const token = helpers.createToken({ id: user.dataValues.id });
        // TODO:add serializer
        return res.status(200).send({ session: { auth: true, token } });
      }
      throw errors.field_validations_failed(paramsValidationsErrors.passwordNotMatch);
    })
    .catch(next);
};
// userDb
//   .findUser(req.body)
//   .then(user => {
//     if (!user) {
//       throw errors.not_found_error(paramsValidationsErrors.notFoundEmail);
//     }
//     if (bcrypt.compareSync(req.body.password, user.dataValues.password)) {
//       logger.info(`User ${user.dataValues.firstName} logged with correct password.`);
//       const token = helpers.createToken({ id: user.dataValues.id });
//       // TODO:add serializer
//       return res.status(200).send({ session: { auth: true, token } });
//     }
//     throw errors.field_validations_failed(paramsValidationsErrors.passwordNotMatch);
//   })
//   .catch(next);
