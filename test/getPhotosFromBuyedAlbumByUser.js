const app = require('../server');
const supertest = require('supertest');
const { factory } = require('factory-girl');
const errors = require('../app/errors');
const { roles } = require('../app/constants/roles');
const constants = require('../app/constants');
// const config = require('../config');

const nock = require('nock');

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

// const mockPhotosAlbunId = [
//   {
//     albumId: 1,
//     id: 1,
//     title: 'accusamus beatae ad facilis cum similique qui sunt',
//     url: 'https://via.placeholder.com/600/92c952',
//     thumbnailUrl: 'https://via.placeholder.com/150/92c952'
//   },
//   {
//     albumId: 1,
//     id: 2,
//     title: 'reprehenderit est deserunt velit ipsam',
//     url: 'https://via.placeholder.com/600/771796',
//     thumbnailUrl: 'https://via.placeholder.com/150/771796'
//   }
// ];

const request = supertest(app);

describe('Get photos from buyed album by user id GET /users/albums/:id/photos', () => {
  let validUserId = null;
  let validAdminUserID = null;
  let validUserToken = null;
  let validAdminUserToken = null;

  afterAll(() => nock.restore());

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
          { userId: validAdminUserID, albumId: 1 }
        ]);
      })
      .then(() =>
        request
          .post('/users/sessions')
          .send({ email: validUser.email, password: validUser.password })
          .then(res => {
            // eslint-disable-next-line prefer-destructuring
            validUserToken = res.body.session.token;
          })
      )
      .then(() =>
        request
          .post('/users/sessions')
          .send({ email: validUserAdmin.email, password: validUserAdmin.password })
          .then(res => {
            // eslint-disable-next-line prefer-destructuring
            validAdminUserToken = res.body.session.token;
            console.log(`------------------>>>>>>>>>><${validAdminUserToken}`);
          })
      )
      //   .then(() =>
      //     nock(config.common.albumsUrl)
      //       .persist()
      //       .get('/photos?albumId=1')
      //       .reply(200, mockPhotosAlbunId)
      //   )
      .catch(err => {
        console.log(err);
      })
      .then(() => done())
  );

  it('Tries to get photos from album with invalid token', done =>
    request
      .get('/users/albums/1/photos')
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

  it('Tries to get photos from album without token', () =>
    request
      .get('/users/albums/1/photos')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send()
      .then(res => {
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
      }));

  it.only('Get photos from buyed album, not being admin user', done =>
    request
      .get('/users/albums/1/photos')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', validUserToken)
      .send()
      .then(res => {
        expect(res.status).toBe(validUserToken);
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('rows');
        expect(res.body.rows.length).toBeGreaterThan(0);
        expect(res.body.count).toBe(1);
        res.body.rows.forEach(element => {
          expect(element).toHaveProperty('albumId');
        });
        done();
      }));

  it('Get own user album, being admin user', done =>
    request
      .get('/users/albums/1/photos')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', validAdminUserToken)
      .send()
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('rows');
        expect(res.body.rows.length).toBeGreaterThan(0);
        expect(res.body.count).toBe(1);
        done();
      }));

  it('Get other user albums, being Admin', done =>
    request
      .get()
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
      .get()
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
