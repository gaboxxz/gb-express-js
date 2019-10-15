const errors = require('../errors');
const albums = require('../services/albums');
const db = require('../models');
const errorMessages = require('../constants/errorsMessages');
const logger = require('../logger');

exports.userBuysAlbum = (albumId, userId) =>
  db.albumsByUser
    .findAndCountAll({ where: { userId, albumId } })
    .catch(err => {
      throw errors.databaseError(err.message);
    })
    .then(albumsByUser => {
      if (albumsByUser.count >= 1) {
        throw errors.userAlreadyHasAlbum(errorMessages.userAlreadyHasAlbum);
      }
      return albums.getAlbumById(albumId);
    })
    .then(retrievedAlbum => {
      logger.info(`Album to buy: ${JSON.stringify(retrievedAlbum)}`);
      return db.albumsByUser.create({ userId, albumId, albumTitle: retrievedAlbum.title }).catch(err => {
        throw errors.databaseError(err.message);
      });
    });

exports.getPhotosFromAlbumByIdAndUser = (albumId, userId) =>
  db.albumsByUser
    .findOne({ where: { userId, albumId } })
    .catch(err => {
      throw errors.databaseError(err.message);
    })
    .then(albumByUser => {
      if (!albumByUser) {
        // TODO: take message to constant
        throw errors.notFoundError('Album not buyed by user');
      }
      return albums.getPhotosByAlbumId(albumId);
    });
