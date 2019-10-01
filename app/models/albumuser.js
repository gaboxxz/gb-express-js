'use strict';
module.exports = (sequelize, DataTypes) => {
  const albumUser = sequelize.define(
    'albums_by_user',
    {
      userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
      albumId: { type: DataTypes.INTEGER, allowNull: false, field: 'album_id' }
    },
    { underscored: true }
  );
  return albumUser;
};
