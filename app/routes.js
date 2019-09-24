const { healthCheck } = require('./controllers/healthCheck');
const albumsController = require('./controllers/albums');
const usersController = require('./controllers/users');
const { validateSchemaAndFail } = require('./middlewares/params_validator');
const { signUp, signIn } = require('./schemas/users');
exports.init = app => {
  app.get('/health', healthCheck);
  app.get('/albums', albumsController.getAlbums);
  app.get('/albums/:id/photos', albumsController.getPhotosByAlbumId);

  app.post('/users/sessions', validateSchemaAndFail(signIn), usersController.signIn);
  app.post('/users', validateSchemaAndFail(signUp), usersController.createUser);
};
