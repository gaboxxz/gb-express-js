const supertest = require('supertest');
const { factory } = require('factory-girl');

const errors = require('../app/errors');
const { roles } = require('../app/constants/roles');
const constants = require('../app/constants');
const app = require('../server');
const helpers = require('./helpers');
const validUser = {
  firstName: 'TestName',
  lastName: 'TestLastName',
  password: '12345678Ab',
  email: 'Test@wolox.com'
};
const validUserAdmin = {
  firstName: 'Admin',
  lastName: 'TestAdmin',
  password: '12345678Ab',
  email: 'TestAdmin@wolox.com',
  role: roles.admin
};
const request = supertest(app);

describe('Authorization tests for GET /users/:user_id/albums ', () => {
  it('Tries to get user albums with invalid token', done =>
    request
      .get('/users/1/albums')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', '000000000FFFFFFFFFFFFF&&//%$')
      .send()
      .then(res => {
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
        done();
      }));
  it('Tries to get user albums without token', () =>
    request
      .get('/users/1/albums')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send()
      .then(res => {
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
      }));
});

describe('Get buyed albums by user id GET /users/:user_id/albums', () => {
  let validUserId = null;
  let validAdminUserID = null;
  let validUserToken = null;
  let validAdminUserToken = null;
  beforeEach(done =>
    factory
      .create('user', validUser)
      .then(user => {
        validUserId = user.id;
        return factory.create('user', validUserAdmin);
      })
      .then(adminUsr => {
        validAdminUserID = adminUsr.id;
        return factory.createMany('albumsByUser', [
          { userId: validUserId, albumId: 1 },
          { userId: validUserId, albumId: 2 },
          { userId: validUserId, albumId: 3 },
          { userId: validAdminUserID, albumId: 1 },
          { userId: validAdminUserID, albumId: 2 },
          { userId: validAdminUserID, albumId: 3 }
        ]);
      })
      .then(() =>
        helpers.userLogin(request, validUser.email, validUser.password).then(token => {
          validUserToken = token;
        })
      )
      .then(() =>
        helpers.userLogin(request, validUserAdmin.email, validUserAdmin.password).then(token => {
          validAdminUserToken = token;
          done();
        })
      )
  );

  it('Get own user album, being not admin user', done =>
    request
      .get(`/users/${validUserId}/albums`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', validUserToken)
      .send()
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('rows');
        expect(res.body.rows.length).toBeGreaterThan(0);
        expect(res.body.count).toBe(3);
        res.body.rows.forEach(element => {
          expect(element).toHaveProperty('album_title');
          expect(element).toHaveProperty('user_id');
          expect(element).toHaveProperty('album_id');
          expect(element).toHaveProperty('updated_at');
          expect(element).toHaveProperty('created_at');
          expect(element.user_id).toBe(validUserId);
        });
        done();
      }));

  it('Get own user album, being admin user', done =>
    request
      .get(`/users/${validAdminUserID}/albums`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', validAdminUserToken)
      .send()
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('rows');
        expect(res.body.rows.length).toBeGreaterThan(0);
        expect(res.body.count).toBe(3);
        res.body.rows.forEach(element => {
          expect(element).toHaveProperty('album_title');
          expect(element).toHaveProperty('user_id');
          expect(element).toHaveProperty('album_id');
          expect(element).toHaveProperty('updated_at');
          expect(element).toHaveProperty('created_at');
          expect(element.user_id).toBe(validAdminUserID);
        });
        done();
      }));

  it('Get other user albums, being Admin', done =>
    request
      .get(`/users/${validUserId}/albums`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', validAdminUserToken)
      .send()
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('rows');
        expect(res.body.rows.length).toBeGreaterThan(0);
        expect(res.body.count).toBe(3);
        res.body.rows.forEach(element => {
          expect(element).toHaveProperty('album_title');
          expect(element).toHaveProperty('user_id');
          expect(element).toHaveProperty('album_id');
          expect(element).toHaveProperty('updated_at');
          expect(element).toHaveProperty('created_at');
          expect(element.user_id).toBe(validUserId);
        });
        done();
      }));

  it('Tries to get other user albums, NOT being Admin', done =>
    request
      .get(`/users/${validAdminUserID}/albums`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', validUserToken)
      .send()
      .then(res => {
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
        expect(res.body.message).toBe(constants.notAdminToGetAlbums);
        done();
      }));
});
