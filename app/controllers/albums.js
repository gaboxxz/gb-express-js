const albums = require('../services/albums');
const logger = require('../../app/logger');
const errors = require('../errors');
const a = require('./viaje');
const albumInteractor = require('../interactors/albums');

exports.getAlbums = (req, res, next) =>
  albums
    .getAlbums(req.query)
    .then(json => {
      logger.info('Albums were fetched from external api');
      a.searchFligths('EZE-sky', 'LHR-sky', '2020-03-01', process.env.ezeLhr);

      setTimeout(() => {
        console.log('Waiting 1');
      }, 6000);

      a.searchFligths('EZE-sky', 'LGW-sky', '2020-03-01', process.env.ezeLGW);

      setTimeout(() => {
        console.log('waiting 2');
      }, 6000);

      a.searchFligths('ROME-sky', 'EZE-sky', '2020-03-23', process.env.romaEzeiza);
      setTimeout(() => {
        console.log('Waiting');
      }, 6000);
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
