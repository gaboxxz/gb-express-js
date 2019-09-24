const { hashPassword } = require('../helpers');

exports.mapUserCreateRequest = userToMap => {
  const userToCreate = {
    firstName: userToMap.first_name,
    lastName: userToMap.last_name,
    email: userToMap.email,
    password: hashPassword(userToMap.password)
  };
  return userToCreate;
};

exports.mapUserSignIn = userToMap => {
  const userToSignIn = {
    email: userToMap.email,
    password: userToMap.password
  };
  return userToSignIn;
};
