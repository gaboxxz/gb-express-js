const albums = require('../services/albums');
const logger = require('../../app/logger');
const errors = require('../errors');
exports.getAlbums = (req, res, next) =>
  albums
    .getAlbums(req.query)
    .then(json => {
      logger.info('Albums were fetched from external api');
      res.status(200).send(JSON.parse(json));
    })
    .catch(err => {
      logger.error('There was an error retrieving albums from external api');
      return next(err);
    });

exports.getPhotosByAlbumId = (req, res, next) => {
  albums
    .getIdAlbumPhotos(req.params)
    .then(response => {
      const albumsById = JSON.parse(response);
      if (albumsById && albumsById.length) {
        logger.info(`Get albums Id returned : ${albumsById.length} objects`);

        return res.status(200).send(albumsById);
      }
      logger.error('Get albums Id returned empty');
      throw errors.notFoundError(`No album found with id: ${req.params.id}`);
    })
    .catch(err => {
      logger.error('There was an error retrieving photos from external api');
      return next(err);
    });
};

exports.buyAlbum = (req, res, next) => {
  logger.info(JSON.stringify(req.params));
  albums
    .getAlbums(req.params)
    .then(response => {
      const album = JSON.parse(response);
      console.log(album.length);
      if (album.length === 0) {
        // TODO: add new error message constant
        throw errors.notFoundError('Album not found');
      } else {
        return album;
      }
    })
    .then(album => {
      if (userHasAlbum(user, album)) {
        // TODO: agregaar otro error posta
        throw errors.unauthorizedError('el usuario ya tiene el album');
      } else {
        userBuyAlbum(user, album);
      }
    })
    .catch(next);
};
// Preguntas: saco toda la logica de compra de albunes a un interactor? . Como hago la relacion de la tabla de albunes por usuario con usuario en el modelo
// y en la migracion?

