const app = require('../server');
const { user } = require('../app/models/');
const helpers = require('../app/helpers');
const supertest = require('supertest');
const { factory } = require('factory-girl');
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
    Promise.all([factory.createMany('user', 15), factory.create('user', validUser)]).then(() =>
      request
        .post('/users/sessions')
        .send(validSignIn)
        .then(res => {
          // eslint-disable-next-line prefer-destructuring
          token = res.body.session.token;
        })
    )
  );

  it.each([[0, 1, 1], [1, 3, 3], [3, 5, 1]])(
    'Page: %i pageSize: %i should return %i',
    (page, pageSize, expected) =>
      request
        .get('/users')
        .set('Content-Type', 'application/json')
        .set('Acccept', 'application/json')
        .set('authorization', token)
        .query({ pageSize, page })
        .send()
        .then(res => {
          expect(res.body).toHaveProperty('count');
          // expect(res.body.count).toBe(expected);
          expect(res.body).toHaveProperty('rows');
          expect(res.status).toBe(200);
          expect(res.body.rows.length).toBe(expected);
        })
  );
});
