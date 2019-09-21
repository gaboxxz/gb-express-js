const app = require('../server');
const supertest = require('supertest');
const validUser = {
  first_name: 'TestName',
  last_name: 'TestLastName',
  password: '12345678Ab',
  email: 'Test@wolox.com'
};
const validSignIn = { email: 'Test@wolox.com', password: '12345678Ab' };

const request = supertest(app);
describe.only('Get /users', () => {
  let response = null;
  beforeEach(done => {
    request
      .post('/users')
      .set('Content-Type', 'application/json')
      .set('Acccept', 'application/json')
      .send(validUser)
      .then(() => {
        request
          .post('/users/sessions')
          .set('Content-Type', 'application/json')
          .set('Acccept', 'application/json')
          .send(validSignIn)
          .end((err, res) => {
            if (err) {
              throw err;
            }
            response = res;
            done();
          });
      });
  });

  it('Get users list', () =>
    request
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('Acccept', 'application/json')
      .set('authorization', response.body.session.token)
      .query({ pageSize: '1', page: '0' })
      .send()
      .then(res => {
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('rows');
        expect(res.status).toBe(200);
        expect(res.body.rows.length).toBe(1);
      }));
});
