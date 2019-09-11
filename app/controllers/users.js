const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const logger = require('../../app/logger');
const db = require('../models');
const errors = require('../errors');

const saltRounds = 10;
exports.createUser = (req, res, next) => {
  const newUserData = req.body;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(newUserData.password, salt);
  newUserData.password = hash;

  db.user
    .create(newUserData)
    .then(createdUser => {
      logger.info(`User ${createdUser.dataValues.firstName} was created.`);
      const data = {
        id: createdUser.dataValues.id,
        firstName: createdUser.dataValues.firstName,
        lastName: createdUser.dataValues.lastName,
        email: createdUser.dataValues.email
      };
      res.status(201).send(data);
    })
    .catch(err => {
      logger.error('Error inserting user in database');
      next(errors.databaseError(err.message));
    });
};

exports.signIn = async (req, res, next) => {
  const paswordReq = req.body.password;
  const { email } = req.body;
  let dbUser = '';
  try {
    dbUser = await db.user.findOne({ where: { email } });
  } catch {
    next(errors.databaseError('Error looking for user in database'));
  }
  if (bcrypt.compareSync(paswordReq, dbUser.dataValues.password)) {
    logger.info(`User ${dbUser.dataValues.firstName} logged with correct password. `);
    // Return token
    const token = jwt.sign({ id: dbUser.dataValues.id }, process.env.SECRET);
    res.status(200).send({ auth: true, token });
  } else {
    next(errors.not_found_error('Wrong Email or Password'));
  }
};
