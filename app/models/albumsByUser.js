'use strict';
module.exports = (sequelize, DataTypes) => {
  const albumsByUser = sequelize.define(
    'albumsByUser',
    {
      userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id', primaryKey: true },
      albumId: { type: DataTypes.INTEGER, allowNull: false, field: 'album_id', primaryKey: true },
      albumTitle: { type: DataTypes.STRING, allowNull: false, field: 'album_title' }
    },
    { underscored: true, tableName: 'albums_by_user' }
  );
  return albumsByUser;
};
