const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');

exports.hashPassword = password => {
  const hash = bcrypt.hashSync(password, parseInt(config.common.saltRounds));
  return hash;
};
exports.createToken = params =>
  jwt.sign({ params }, config.common.session.secret, { expiresIn: process.env.SESSION_EXPIRE_TIME });
exports.passwordChecks = (requestPassword, encryptedPassword) =>
  bcrypt.compareSync(requestPassword, encryptedPassword);
