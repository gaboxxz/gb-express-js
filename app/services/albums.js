const errors = require('../errors');
const rp = require('request-promise');

exports.getAlbums = queryParams =>
  rp({
    uri: `${process.env.ALBUMS_URL}albums`,
    qs: queryParams,
    method: 'Get'
  }).catch(err => {
    throw errors.externalApiError(err.message);
  });

exports.getIdAlbumPhotos = id =>
  rp({
    uri: `${process.env.ALBUMS_URL}photos`,
    qs: {
      albumId: id
    },
    method: 'GET'
  }).catch(err => {
    throw errors.externalApiError(err.message);
  });
