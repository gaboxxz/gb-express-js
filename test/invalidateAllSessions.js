const app = require('../server');
const supertest = require('supertest');
const { factory } = require('factory-girl');
const errors = require('../app/errors');
const errorMessages = require('../app/constants/errorsMessages');

const nock = require('nock');

const validUser = {
  first_name: 'TestName',
  last_name: 'TestLastName',
  password: '12345678Ab',
  email: 'Test@wolox.com'
};
const validSignIn = { email: validUser.email, password: validUser.password };

const request = supertest(app);
describe('Invalidate sessions Post /users/sessions/invalidate_all', () => {
  let token = null;
  afterAll(() => nock.restore());

  beforeEach(() =>
    factory
      .create('user', {
        firstName: validUser.first_name,
        lastName: validUser.last_name,
        email: validUser.email,
        password: validUser.password
      })
      .then(() =>
        request
          .post('/users/sessions')
          .send(validSignIn)
          .then(res => {
            // eslint-disable-next-line prefer-destructuring
            token = res.body.session.token;
          })
      )
  );

  it('Tries to invalidate sessions with invalid authorization', done =>
    request
      .post('/users/sessions/invalidate_all')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', '000000FFFFFFFFFFFF')
      .send()
      .then(res => {
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body).toHaveProperty('message');
        done();
      }));

  it('Tries to invalidate sessions without authorization', () =>
    request
      .post('/users/sessions/invalidate_all')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then(res => {
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body).toHaveProperty('message');
      }));

  it('Invalidates al sessions', () =>
    request
      .post('/users/sessions/invalidate_all')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', token)
      .send()
      .then(res => {
        expect(res.status).toBe(200);
        return request
          .get('/users')
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .set('authorization', token)
          .send();
      })
      .then(res => {
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body).toHaveProperty('message');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
        expect(res.body.message).toBe(errorMessages.sessionExpired);
      }));
});
