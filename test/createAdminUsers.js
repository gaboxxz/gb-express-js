const app = require('../server');
// const { user } = require('../app/models');
// const helpers = require('../app/helpers');
const supertest = require('supertest');
const { factory } = require('factory-girl');
// const errors = require('../app/errors');
// const { paramsValidationsErrors } = require('../app/constants/errorsMessages');
const validUser = {
  first_name: 'TestName',
  last_name: 'TestLastName',
  password: '12345678Ab',
  email: 'Test@wolox.com'
};
const validSignIn = { email: 'Test@wolox.com', password: '12345678Ab' };

// factory.define(
//   'user',
//   user,
//   {
//     firstName: factory.chance('name', { middle: true }),
//     lastName: factory.chance('name', { middle: true }),
//     email: factory.chance('email', { domain: 'wolox.com' }),
//     password: factory.chance('string', { length: 8 }),
//     isAdmin: Boolean
//   },
//   {
//     afterBuild: model => {
//       model.password = helpers.hashPassword(model.password);
//       return model;
//     }
//   }
// );

const request = supertest(app);

describe('Post admin/users', () => {
  let token = null;
  beforeEach(() =>
    factory
      .create('user', {
        firstName: validUser.first_name,
        lastName: validUser.last_name,
        email: validUser.email,
        password: validUser.password,
        isAdmin: true
      })
      .then(() => factory.createMany('user', 5))
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

  it.only('Creates new valid user', () =>
    request
      .post('/admin/users')
      .set('Content-Type', 'application/json')
      .set('Acccept', 'application/json')
      .set('authorization', token)
      // eslint-disable-next-line no-extra-parens
      .send({ ...validUser, email: 'TestAdmin1@wolox.com.ar' })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('first_name');
        expect(res.body.user).toHaveProperty('last_name');
        expect(res.body.user).toHaveProperty('email');
        expect(res.body.user).toHaveProperty('is_admin');
        expect(res.body.user.first_name).toBe(validUser.first_name);
        expect(res.body.user.last_name).toBe(validUser.last_name);
        expect(res.body.user.email).toBe('TestAdmin1@wolox.com.ar');
        expect(res.body.user.is_admin).toBe(true);
      }));
});
