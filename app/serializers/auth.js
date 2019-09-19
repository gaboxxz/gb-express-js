exports.serializeToken = token => {
  const serializedToken = {
    session: { auth: true, token }
  };
  return serializedToken;
};
