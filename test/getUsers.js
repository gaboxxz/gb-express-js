const app = require('../server');
const { user } = require('../app/models/');
const helpers = require('../app/helpers');
const supertest = require('supertest');
const { factory } = require('factory-girl');
const errors = require('../app/errors');
const constants = require('../app/constants');
const { paramsValidationsErrors } = require('../app/constants/errorsMessages');
const validUser = {
  firstName: 'TestName',
  lastName: 'TestLastName',
  password: '12345678Ab',
  email: 'Test@wolox.com'
};
const validSignIn = { email: 'Test@wolox.com', password: '12345678Ab' };

factory.define(
  'user',
  user,
  {
    firstName: factory.chance('name', { middle: true }),
    lastName: factory.chance('name', { middle: true }),
    email: factory.chance('email', { domain: 'wolox.com' }),
    password: factory.chance('string', { length: 8 })
  },
  {
    afterBuild: model => {
      model.password = helpers.hashPassword(model.password);
      return model;
    }
  }
);

const request = supertest(app);

describe('Get /users', () => {
  let token = null;
  beforeEach(() =>
    factory
      .create('user', validUser)
      .then(() => factory.createMany('user', 15))
      .then(() =>
        request
          .post('/users/sessions')
          .send(validSignIn)
          .then(
            res =>
              // eslint-disable-next-line prefer-destructuring
              (token = res.body.session.token)
          )
      )
  );

  it.each([[1, 1, 1], [1, 3, 3], [4, 5, 1]])(
    'Page: %i pageSize: %i should return %i',
    (page, pageSize, expected) =>
      request
        .get('/users')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('authorization', token)
        .query({ pageSize, page })
        .send()
        .then(res => {
          expect(res.body).toHaveProperty('count');
          expect(res.body).toHaveProperty('rows');
          expect(res.status).toBe(200);
          expect(res.body.rows.length).toBe(expected);
        })
  );
  it('Does not send page param, should return default limits', () =>
    request
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', token)
      .query({ pageSize: 1 })
      .send()
      .then(res => {
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('rows');
        expect(res.status).toBe(200);
        expect(res.body.rows.length).toBe(constants.DEFAULT_LIMIT);
      }));
  it('Does not send any param, should return default limits', () =>
    request
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', token)
      .send()
      .then(res => {
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('rows');
        expect(res.status).toBe(200);
        expect(res.body.rows.length).toBe(constants.DEFAULT_LIMIT);
      }));
  it('Does not send pageSize param, should return default limit', () =>
    request
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', token)
      .query({ page: 1 })
      .send()
      .then(res => {
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('rows');
        expect(res.status).toBe(200);
        expect(res.body.rows.length).toBe(constants.DEFAULT_LIMIT);
      }));
  it('Tries to get users list with invalid token', () =>
    request
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', '000000000FFFFFFFFFFFFF&&//%$')
      .send()
      .then(res => {
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
      }));
  it('Tries to get users list without token', () =>
    request
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send()
      .then(res => {
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
      }));

  it('Sends param PAGE with negative value', () =>
    request
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .set('Accept', 'application/json')
      .query({ page: -1 })
      .send()
      .then(res => {
        expect(res.body.message[0].message).toBe(paramsValidationsErrors.invalidPageParam);
        expect(res.body.internal_code).toBe(errors.VALIDATION_ERROR);
      }));

  it('Sends param PAGESIZE with negative value', () =>
    request
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .set('Accept', 'application/json')
      .query({ pageSize: -1 })
      .send()
      .then(res => {
        expect(res.body.message[0].message).toBe(paramsValidationsErrors.invalidPageSizeParam);
        expect(res.body.internal_code).toBe(errors.VALIDATION_ERROR);
      }));

  it('Sends param PAGE with zero value', () =>
    request
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .set('Acccept', 'application/json')
      .query({ page: 0 })
      .send()
      .then(res => {
        expect(res.body.message[0].message).toBe(paramsValidationsErrors.invalidPageParam);
        expect(res.body.internal_code).toBe(errors.VALIDATION_ERROR);
      }));

  it('Sends param PAGESIZE with zero value', () =>
    request
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .set('Acccept', 'application/json')
      .query({ pageSize: 0 })
      .send()
      .then(res => {
        expect(res.body.message[0].message).toBe(paramsValidationsErrors.invalidPageSizeParam);
        expect(res.body.internal_code).toBe(errors.VALIDATION_ERROR);
      }));
});
