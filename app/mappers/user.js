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

exports.mapLoggedUser = userToMap => {
  const userLogged = {
    id: userToMap.id,
    firstName: userToMap.firstName,
    lastName: userToMap.lastName,
    email: userToMap.email,
    role: userToMap.role
  };
  return userLogged;
};
