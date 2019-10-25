exports.serializeAlbumsResponse = findedAlbums => ({
  count: findedAlbums.rows.length,
  rows: findedAlbums.rows.map(element => ({
    user_id: element.userId,
    album_id: element.albumId,
    album_title: element.albumTitle,
    created_at: element.created_at,
    updated_at: element.updated_at
  }))
});
