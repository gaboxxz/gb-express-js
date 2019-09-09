const { healthCheck } = require('./controllers/healthCheck');
const albumsController = require('./controllers/albums');
const usersController = require('./controllers/users');

const { validateChecks, checks, checksSignIn, validateChecksSignIn } = require('./middlewares/users');

exports.init = app => {
  app.get('/health', healthCheck);
  app.get('/albums', albumsController.getAlbums);
  app.get('/albums/:id/photos', albumsController.getPhotosByAlbumId);
  app.post('/users', checks, validateChecks, usersController.createUser);
  app.post('/users/sessions', checksSignIn, validateChecksSignIn, usersController.signIn);
};
