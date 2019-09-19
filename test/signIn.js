const app = require('../server');
const errors = require('../app/errors');
const supertest = require('supertest');
const { paramsValidationsErrors } = require('../app/constants/errorsMessages');
const validUser = {
  first_name: 'TestName',
  last_name: 'TestLastName',
  password: '12345678Ab',
  email: 'Test@wolox.com'
};
const validSignIn = {
  password: '12345678Ab',
  email: 'Test@wolox.com'
};
const request = supertest(app);
describe('Post /users/sessions', () => {
  beforeEach(async () => {
    await request
      .post('/users')
      .set('Content-Type', 'application/json')
      .set('Acccept', 'application/json')
      .send(validUser);
  });

  it('It signs in with valid email and password', async done => {
    const response = await request
      .post('/users/sessions')
      .set('Content-Type', 'application/json')
      .set('Acccept', 'application/json')
      .send(validSignIn);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('session');
    expect(response.body.session).toHaveProperty('auth');
    expect(response.body.session).toHaveProperty('token');
    expect(response.body.session.auth).toBe(true);
    expect(response.body.session.token).not.toBe('');
    done();
  });

  it('Tries to sign in with email not registered', async done => {
    const response = await request
      .post('/users/sessions')
      .set('Content-Type', 'application/json')
      .set('Acccept', 'application/json')
      .send({
        ...validSignIn,
        email: 'notRegisteredEmail@wolox.com'
      });
    expect(response.status).toBe(404);
    expect(response.body.internal_code).toBe(errors.NOT_FOUND_ERROR);
    expect(response.body.message).toBe(paramsValidationsErrors.notFoundEmail);
    done();
  });

  it('Tries to sign in with valid email and invalid password', async done => {
    const response = await request
      .post('/users/sessions')
      .set('Content-Type', 'application/json')
      .set('Acccept', 'application/json')
      .send({
        ...validSignIn,
        password: '000000ffffff'
      });
    expect(response.status).toBe(401);
    expect(response.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
    done();
  });
});
