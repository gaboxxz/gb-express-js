const errors = require('../errors');
const rp = require('request-promise');
const config = require('../../config');
exports.getAlbums = queryParams =>
  rp({
    uri: `${config.common.albumsUrl}albums`,
    qs: queryParams,
    method: 'Get'
  }).catch(err => {
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
