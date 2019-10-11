const app = require('../server');
const supertest = require('supertest');
const { factory } = require('factory-girl');
const errors = require('../app/errors');
// const constants = require('../app/constants');
// const { paramsValidationsErrors } = require('../app/constants/errorsMessages');
const validUser = {
  firstName: 'TestName',
  lastName: 'TestLastName',
  password: '12345678Ab',
  email: 'Test@wolox.com'
};
const validSignIn = { email: 'Test@wolox.com', password: '12345678Ab' };

const request = supertest(app);

describe('Get buyed albums by user id GET /users/:user_id/albums', () => {
  // eslint-disable-next-line no-unused-vars
  let token = null;
  beforeEach(done =>
    factory
      .create('user', validUser)
      .then(() => factory.createMany('user', 2))
      .then(() =>
        request
          .post('/users/sessions')
          .send(validSignIn)
          .then(res => {
            // eslint-disable-next-line prefer-destructuring
            token = res.body.session.token;
            return done();
          })
      )
  );
  it('Tries to get user albums with invalid token', () =>
    request
      .get('/users/1/albums')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', '000000000FFFFFFFFFFFFF&&//%$')
      .send()
      .then(res => {
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
      }));
  it('Tries to get user albums without token', () =>
    request
      .get('/users/1/albums')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send()
      .then(res => {
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
      }));

  //   it.only('Get own user album, being not admin user', () => {
  //       request
  //       .get('/users/')
  //   });
});
