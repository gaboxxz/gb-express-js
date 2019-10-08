const app = require('../server');
const supertest = require('supertest');
const { factory } = require('factory-girl');
const errors = require('../app/errors');
const errorMessages = require('../app/constants/errorsMessages');
const config = require('../config');
const nock = require('nock');
const validUser = {
  first_name: 'TestName',
  last_name: 'TestLastName',
  password: '12345678Ab',
  email: 'Test@wolox.com'
};

const validSignIn = { email: validUser.email, password: validUser.password };
const mockAlbum = {
  userId: 1,
  id: 2,
  title: 'My album title.'
};
const nonExistantAlbumId = 9999;
const request = supertest(app);
describe('Post /albums/:id', () => {
  let token = null;
  let userId = null;
  const respo = [];
  afterAll(() => nock.restore());

  beforeEach(() =>
    factory
      .create('user', {
        firstName: validUser.first_name,
        lastName: validUser.last_name,
        email: validUser.email,
        password: validUser.password
      })
      .then(user => {
        userId = user.id;
        return request
          .post('/users/sessions')
          .send(validSignIn)
          .then(res => {
            // eslint-disable-next-line prefer-destructuring
            token = res.body.session.token;
          });
      })
      .then(() =>
        nock(config.common.albumsUrl)
          .persist()
          .get(`/albums?id=${mockAlbum.id}`)
          .reply(200, [mockAlbum])
      )
  );

  it('Buys valid album', () =>
    request
      .post(`/albums/${mockAlbum.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', token)
      .send()
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('albumId');
        expect(res.body).toHaveProperty('albumTitle');
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('userId');
        expect(res.body.albumTitle).toBe(mockAlbum.title);
        expect(res.body.albumId).toBe(mockAlbum.id);
        expect(res.body.userId).toBe(userId);
      }));

  it('Tries to buy an album already bought', () =>
    request
      .post(`/albums/${mockAlbum.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', token)
      .send()
      .then(() =>
        request
          .post(`/albums/${mockAlbum.id}`)
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .set('authorization', token)
          .send()
      )
      .then(res => {
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body).toHaveProperty('message');
        expect(res.body.internal_code).toBe(errors.USER_ALREADY_HAS_ALBUM);
        expect(res.body.message).toBe(errorMessages.userAlreadyHasAlbum);
      }));

  it('Tries to buy non existant album, returns not found error', () => {
    nock(config.common.albumsUrl)
      .get(`/albums?id=${nonExistantAlbumId}`)
      .reply(200, respo);
    return request
      .post(`/albums/${nonExistantAlbumId}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', token)
      .send()
      .then(res => {
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body).toHaveProperty('message');
        expect(res.body.internal_code).toBe(errors.NOT_FOUND_ERROR);
        expect(res.body.message).toBe(errorMessages.albumNotFound);
      });
  });

  it('Tries to buy album without authorization', done =>
    request
      .post(`/albums/${mockAlbum.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', '000000FFFFFFFFFFFF')
      .send()
      .then(res => {
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('internal_code');
        expect(res.body).toHaveProperty('message');
        expect(res.body.internal_code).toBe(errors.UNAUTHORIZED_ERROR);
        expect(res.body.message).toBe(errorMessages.invalidToken);
        done();
      }));
});
