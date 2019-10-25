const app = require('../server');
const supertest = require('supertest');
const { factory } = require('factory-girl');

const request = supertest(app);

const validUser = {
  first_name: 'TestName',
  last_name: 'TestLastName',
  password: '12345678Ab',
  email: 'Test@wolox.com'
};
const validSignIn = {
  password: validUser.password,
  email: validUser.email
};

describe('Token expiration tests', () => {
  let token = null;

  beforeEach(() => {
    process.env.SESSION_EXPIRE_TIME = '1ms';
    return factory.create('user', {
      firstName: validUser.first_name,
      lastName: validUser.last_name,
      email: validUser.email,
      password: validUser.password
    });
  });

  afterEach(() => (process.env.SESSION_EXPIRE_TIME = '2h'));

  it('Signs in and tries to access protected endpoint with expired token', () =>
    request
      .post('/users/sessions')
      .send(validSignIn)
      .then(res => {
        // eslint-disable-next-line prefer-destructuring
        token = res.body.session.token;
      })
      .then(() =>
        request
          .post('/albums/1')
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .set('authorization', token)
          .send()
          .then(response => {
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toHaveProperty('expiredAt');
            expect(response.body.message).toHaveProperty('name');
            expect(response.body.message).toHaveProperty('message');
          })
      ));
});
