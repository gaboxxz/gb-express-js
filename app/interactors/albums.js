// const logger = require('../../app/logger');
const errors = require('../errors');
const albums = require('../services/albums');
const db = require('../models');
const errorMessages = require('../constants/errorsMessages');
const logger = require('../logger');
exports.userBuysAlbum = (albumId, userId) => {
  let albumToBuy = null;
  return albums
    .getAlbums({ id: albumId })
    .then(response => {
      logger.info(`Retrieved album from external service to buy ${response}`);
      const album = JSON.parse(response);
      if (album.length === 0) {
        throw errors.notFoundError(errorMessages.albumNotFound);
      }
      if (album.length > 1) {
        throw errors.externalApiError(errorMessages.moreThanOneAlbumFound);
      }
      albumToBuy = album[0];
      return db.albumsByUser.findAndCountAll({ where: { user_id: userId, album_id: albumId } }).catch(err => {
        throw errors.databaseError(err.message);
      });
    })
    .then(albumUser => {
      if (albumUser.count >= 1) {
        throw errors.usarAlreadyHasAlbum(errorMessages.userAlreadyHasAlbum);
      }
      return db.albumsByUser.create({ userId, albumId, albumTitle: albumToBuy.title }).catch(err => {
        throw errors.databaseError(err.message);
      });
    });
};
