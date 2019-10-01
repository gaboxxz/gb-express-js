const app = require('../server');
<<<<<<< HEAD
const supertest = require('supertest');
const { factory } = require('factory-girl');
const errors = require('../app/errors');
const errorMessages = require('../app/constants/errorsMessages');
=======
// const { user } = require('../app/models');
// const helpers = require('../app/helpers');
const supertest = require('supertest');
const { factory } = require('factory-girl');
// const errors = require('../app/errors');
// const { paramsValidationsErrors } = require('../app/constants/errorsMessages');
>>>>>>> Admin user support.
const validUser = {
  first_name: 'TestName',
  last_name: 'TestLastName',
  password: '12345678Ab',
  email: 'Test@wolox.com'
};
<<<<<<< HEAD

const validUserNotAdmin = {
  first_name: 'UserNotAdmin',
  last_name: 'last name',
  password: '12345678Ab',
  email: 'notAdmin@wolox.com'
};
const validSignIn = { email: 'Test@wolox.com', password: '12345678Ab' };

=======
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

>>>>>>> Admin user support.
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

  it('Creates new valid Admin user', () =>
    request
      .post('/admin/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
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

  it('Creates new Admin of existent user not admin', () =>
    factory
      .create('user', {
        firstName: validUserNotAdmin.first_name,
        lastName: validUserNotAdmin.last_name,
        email: validUserNotAdmin.email,
        password: validUserNotAdmin.password,
        isAdmin: false
      })
      .then(() =>
        request
          .post('/admin/users')
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .set('authorization', token)
          .send(validUserNotAdmin)
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user).toHaveProperty('first_name');
            expect(res.body.user).toHaveProperty('last_name');
            expect(res.body.user).toHaveProperty('email');
            expect(res.body.user).toHaveProperty('is_admin');
            expect(res.body.user.first_name).toBe(validUserNotAdmin.first_name);
            expect(res.body.user.last_name).toBe(validUserNotAdmin.last_name);
            expect(res.body.user.email).toBe(validUserNotAdmin.email);
            expect(res.body.user.is_admin).toBe(true);
          })
      ));

  it('Tries to create new valid Admin user with invalid token', () =>
    request
      .post('/admin/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', '/&%/%&/%&&&%00000FFFFFFFf')
      // eslint-disable-next-line no-extra-parens
      .send({ ...validUser, email: 'TestAdmin1@wolox.com.ar' })
      .then(res => {
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
      }));

  it.only('Tries to create new valid Admin user with user that is not admin', () => {
    let tokenTest = null;

    return factory
      .create('user', {
        firstName: validUserNotAdmin.first_name,
        lastName: validUserNotAdmin.last_name,
        email: validUserNotAdmin.email,
        password: validUserNotAdmin.password,
        isAdmin: false
      })
      .then(() =>
        request
          .post('/users/sessions')
          .send({ ...validSignIn, email: validUserNotAdmin.email })
          .then(res => {
            tokenTest = res.body.session.token;
          })
      )
      .then(() =>
        request
          .post('/admin/users')
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .set('authorization', tokenTest)
          // eslint-disable-next-line no-extra-parens
          .send({ ...validUser, email: 'TestAdmin12@wolox.com.ar' })
      )
      .then(res => {
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body).toHaveProperty('message');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
        expect(res.body.message).toBe(errorMessages.notadminUser);
      });
  });
});
