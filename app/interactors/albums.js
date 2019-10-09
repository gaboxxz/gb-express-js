const errors = require('../errors');
const albums = require('../services/albums');
const db = require('../models');
const errorMessages = require('../constants/errorsMessages');
const logger = require('../logger');

exports.userBuysAlbum = (albumId, userId) => {
  let albumToBuy = null;
  return albums
    .getAlbum(albumId)
    .then(album => {
      logger.info(`Retrieved album from external service to buy ${JSON.stringify(album)}`);
      albumToBuy = album;
      return db.albumsByUser.findAndCountAll({ where: { userId, albumId } }).catch(err => {
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
