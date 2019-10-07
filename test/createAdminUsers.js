const app = require('../server');
const supertest = require('supertest');
const { factory } = require('factory-girl');
const errors = require('../app/errors');
const errorMessages = require('../app/constants/errorsMessages');
const { roles } = require('../app/constants/roles');
const validUser = {
  first_name: 'TestName',
  last_name: 'TestLastName',
  password: '12345678Ab',
  email: 'Test@wolox.com'
};

const validUserNotAdmin = {
  first_name: 'UserNotAdmin',
  last_name: 'last name',
  password: '12345678Ab',
  email: 'notAdmin@wolox.com'
};
const validSignIn = { email: 'Test@wolox.com', password: '12345678Ab' };

const request = supertest(app);

describe('Post admin/users', () => {
  let token = null;
  let usersNotAdminCreated = null;
  beforeEach(done =>
    factory
      .create('user', {
        firstName: validUser.first_name,
        lastName: validUser.last_name,
        email: validUser.email,
        password: validUser.password,
        role: roles.admin
      })
      .then(() => factory.createMany('user', 5))
      .then(users => {
        usersNotAdminCreated = users;
        return request
          .post('/users/sessions')
          .send(validSignIn)
          .then(res => {
            // eslint-disable-next-line prefer-destructuring
            token = res.body.session.token;
            done();
          });
      })
  );

  it('Creates new valid Admin user', () =>
    request
      .post('/admin/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', token)
      .send({ ...validUser, email: 'TestAdmin1@wolox.com.ar' })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('first_name');
        expect(res.body.user).toHaveProperty('last_name');
        expect(res.body.user).toHaveProperty('email');
        expect(res.body.user).toHaveProperty('role');
        expect(res.body.user.first_name).toBe(validUser.first_name);
        expect(res.body.user.last_name).toBe(validUser.last_name);
        expect(res.body.user.email).toBe('TestAdmin1@wolox.com.ar');
        expect(res.body.user.role).toBe(roles.admin);
      }));

  it('Creates new Admin of existent user not admin', done =>
    request
      .post('/admin/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', token)
      .send({
        first_name: usersNotAdminCreated[0].firstName,
        last_name: usersNotAdminCreated[0].lastName,
        email: usersNotAdminCreated[0].email,
        password: 'Password1234'
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('first_name');
        expect(res.body.user).toHaveProperty('last_name');
        expect(res.body.user).toHaveProperty('email');
        expect(res.body.user).toHaveProperty('role');
        expect(res.body.user.first_name).toBe(usersNotAdminCreated[0].firstName);
        expect(res.body.user.last_name).toBe(usersNotAdminCreated[0].lastName);
        expect(res.body.user.email).toBe(usersNotAdminCreated[0].email);
        expect(res.body.user.role).toBe(roles.admin);
        done();
      }));

  it('Tries to create new valid Admin user with invalid token', () =>
    request
      .post('/admin/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', '/&%/%&/%&&&%00000FFFFFFFf')
      .send({ ...validUser, email: 'TestAdmin1@wolox.com.ar' })
      .then(res => {
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
      }));

  it('Tries to create new valid Admin user with user that is not admin', () => {
    let tokenTest = null;

    return factory
      .create('user', {
        firstName: validUserNotAdmin.first_name,
        lastName: validUserNotAdmin.last_name,
        email: validUserNotAdmin.email,
        password: validUserNotAdmin.password
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
