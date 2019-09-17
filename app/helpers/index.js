const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SALT_ROUNDS } = require('../constants');
const config = require('../../config');
exports.hashPassword = password => {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

exports.createToken = params => jwt.sign({ params }, config.common.session.secret);
