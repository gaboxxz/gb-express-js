const albums = require('../services/albums');
const logger = require('../../app/logger');
const errors = require('../errors');

const albumInteractor = require('../interactors/albums');

exports.getAlbums = (req, res, next) =>
  albums
    .getAlbums(req.query)
    .then(json => {
      logger.info('Albums were fetched from external api');
      res.status(200).send(json);
    })
    .catch(err => {
      logger.error('There was an error retrieving albums from external api');
      return next(err);
    });

exports.getPhotosByAlbumId = (req, res, next) => {
  {
    const albumId = req.params.id;
    return albums
      .getPhotosByAlbumId(albumId)
      .then(response => {
        const albumsById = response;
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
  }
};

exports.buyAlbum = (req, res, next) => {
  const albumIb = req.params.id;
  const userId = req.user.id;

  return albumInteractor
    .userBuysAlbum(albumIb, userId)
    .then(buyedAlbum => res.send(buyedAlbum))
    .catch(next);
};
