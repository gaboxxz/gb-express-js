const { healthCheck } = require('./controllers/healthCheck');
const albumsController = require('./controllers/albums');
const usersController = require('./controllers/users');
const { validateSchemaAndFail } = require('./middlewares/params_validator');
const { signUp, signIn, getUsersSchema } = require('./schemas/users');
const { authenticate, authenticateAdmin, checkAccessToAlbums } = require('./middlewares/auth');

exports.init = app => {
  app.get('/health', healthCheck);
  app.get('/albums', albumsController.getAlbums);
  app.get('/albums/:id/photos', albumsController.getPhotosByAlbumId);
  app.post('/albums/:id', authenticate, albumsController.buyAlbum);
  app.get('/users/:user_id/albums', [authenticate, checkAccessToAlbums], albumsController.getAlbumsByUserId);

  app.get('/users/albums/:id/photos', authenticate, albumsController.getPhotosFromBuyedAlbum);
  app.post('/users/sessions', validateSchemaAndFail(signIn), usersController.signIn);
  app.post('/users/sessions/invalidate_all', authenticate, usersController.invalidateSessions);
  app.post('/users', validateSchemaAndFail(signUp), usersController.createUser);
  app.get('/users', authenticate, validateSchemaAndFail(getUsersSchema), usersController.getUsers);

  app.use('/admin', authenticate, authenticateAdmin);
  app.post('/admin/users', validateSchemaAndFail(signUp), usersController.createAdminUser);
};
