const errors = require('../errors');
const rp = require('request-promise');
const config = require('../../config');
const errorMessages = require('../constants/errorsMessages');

exports.getAlbumById = albumId =>
  rp({
    uri: `${config.common.albumsUrl}albums/${albumId}`,
    method: 'GET',
    json: true
  }).catch(err => {
    if (err.statusCode === 404) {
      throw errors.notFoundError(errorMessages.albumNotFound);
    }
    throw errors.externalApiError(err.message);
  });

exports.getAlbums = query =>
  rp({
    uri: `${config.common.albumsUrl}albums`,
    qs: query,
    method: 'GET',
    json: true
  }).catch(err => {
    if (err.statusCode === 404) {
      throw errors.notFoundError(errorMessages.albumNotFound);
    }
    throw errors.externalApiError(err.message);
  });

exports.getPhotosByAlbumId = id =>
  rp({
    uri: `${config.common.albumsUrl}photos`,
    qs: {
      albumId: id
    },
    method: 'GET',
    json: true
  }).catch(err => {
    throw errors.externalApiError(err.message);
  });
