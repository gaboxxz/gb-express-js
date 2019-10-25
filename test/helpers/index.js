exports.userLogin = (request, email, password) =>
  request
    .post('/users/sessions')
    .send({ email, password })
    .then(res => res.body.session.token);
