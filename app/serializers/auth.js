exports.serializeToken = token => {
  const serializedToken = {
    session: { auth: true, token, expiration_time: process.env.SESSION_EXPIRE_TIME }
  };
  return serializedToken;
};
