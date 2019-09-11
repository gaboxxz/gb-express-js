const app = require('../server');

const supertest = require('supertest');
// const jwt = require('jsonwebtoken');

const request = supertest(app);
describe('Post /users/sessions', () => {
  beforeEach(async () => {
    await request
      .post('/users')
      .set('Content-Type', 'application/json')
      .set('Acccept', 'application/json')
      .send({
        firstName: 'TestName',
        lastName: 'TestLastName',
        password: '12345678Ab',
        email: 'Test@wolox.com'
      });
  });

  it('It signs in with valid email and password', async done => {
    const response = await request
      .post('/users/sessions')
      .set('Content-Type', 'application/json')
      .set('Acccept', 'application/json')
      .send({
        password: '12345678Ab',
        email: 'Test@wolox.com'
      });
    expect(response.status).toBe(200);
    done();
  });

  it('Tries to sign in with email not registered', async done => {
    const response = await request
      .post('/users/sessions')
      .set('Content-Type', 'application/json')
      .set('Acccept', 'application/json')
      .send({
        password: '12345678Ab',
        email: 'notRegisteredEmail@wolox.com'
      });
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      message: 'Wrong Email or Password',
      internal_code: 'Not Found'
    });
    done();
  });

  it('Tries to sign in with valid email and invalid password', async done => {
    const response = await request
      .post('/users/sessions')
      .set('Content-Type', 'application/json')
      .set('Acccept', 'application/json')
      .send({
        password: '000000099998',
        email: 'Test@wolox.com'
      });
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      message: 'Wrong Email or Password',
      internal_code: 'Not Found'
    });
    done();
  });

  it('Tries to sign in with invalid email', async done => {
    const response = await request
      .post('/users/sessions')
      .set('Content-Type', 'application/json')
      .set('Acccept', 'application/json')
      .send({
        password: '000000099998',
        email: 'Test@wolo.com'
      });
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      message: 'Wrong Email or Password',
      internal_code: 'Not Found'
    });
    done();
  });
});
