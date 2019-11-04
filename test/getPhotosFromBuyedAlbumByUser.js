const app = require('../server');
const supertest = require('supertest');
const { factory } = require('factory-girl');
const errors = require('../app/errors');
const { roles } = require('../app/constants/roles');
const config = require('../config');

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

const mockAlbumId = 1;
const requestPhotosUrl = `/users/albums/${mockAlbumId}/photos`;
const mockPhotosAlbunId = [
  {
    albumId: mockAlbumId,
    id: 1,
    title: 'accusamus beatae ad facilis cum similique qui sunt',
    url: 'https://via.placeholder.com/600/92c952',
    thumbnailUrl: 'https://via.placeholder.com/150/92c952'
  },
  {
    albumId: mockAlbumId,
    id: 2,
    title: 'reprehenderit est deserunt velit ipsam',
    url: 'https://via.placeholder.com/600/771796',
    thumbnailUrl: 'https://via.placeholder.com/150/771796'
  }
];

const request = supertest(app);

describe('Get photos from buyed album by user id GET /users/albums/:id/photos', () => {
  let validUserId = null;
  let validAdminUserID = null;
  let validUserToken = null;
  let validAdminUserToken = null;

  afterAll(() => nock.restore());
  beforeAll(() => {
    if (!nock.isActive()) {
      nock.activate();
    }
  });

  beforeEach(() =>
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
            validUserToken = res.body.session.token;
          })
      )
      .then(() =>
        request
          .post('/users/sessions')
          .send({ email: validUserAdmin.email, password: validUserAdmin.password })
          .then(res => {
            validAdminUserToken = res.body.session.token;
          })
      )
      .then(() => {
        nock(config.common.albumsUrl)
          .get('/photos')
          .query(true)
          .reply(200, mockPhotosAlbunId);
      })
  );

  it('Tries to get photos from album with invalid token', done =>
    request
      .get(requestPhotosUrl)
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
      .get(requestPhotosUrl)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send()
      .then(res => {
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
      }));

  it('Get photos from buyed album, not being admin user', done =>
    request
      .get(requestPhotosUrl)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', validUserToken)
      .send()
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('rows');
        expect(res.body.rows.length).toBeGreaterThan(0);
        expect(res.body.count).toBe(2);
        res.body.rows.forEach(element => {
          expect(element).toHaveProperty('albumId');
        });
        done();
      }));

  it('Get own user album, being admin user', done =>
    request
      .get(requestPhotosUrl)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', validAdminUserToken)
      .send()
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('rows');
        expect(res.body.rows.length).toBeGreaterThan(0);
        expect(res.body.count).toBe(2);
        res.body.rows.forEach(element => {
          expect(element).toHaveProperty('albumId');
        });
        done();
      }));

  it('Tries to get photos from not buyed album', () =>
    request
      .get('/users/albums/987/photos')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', validUserToken)
      .send()
      .then(res => {
        expect(res.status).toBe(404);
      }));
});
