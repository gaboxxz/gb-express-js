const errors = require('../errors');
const rp = require('request-promise');
const config = require('../../config');
const errorMessages = require('../constants/errorsMessages');

exports.getAlbum = albumId =>
  rp({
    uri: `${config.common.albumsUrl}albums/${albumId}`,
    method: 'Get',
    json: true
  }).catch(err => {
    if (err.statusCode === 404) {
      throw errors.notFoundError(errorMessages.albumNotFound);
    }
    throw errors.externalApiError(err.message);
  });

exports.getIdAlbumPhotos = id =>
  rp({
    uri: `${config.common.albumsUrl}photos`,
    qs: {
      albumId: id
    },
    method: 'GET'
  }).catch(err => {
    throw errors.externalApiError(err.message);
  });
