'use strict';
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      'albums_by_user',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          notEmpty: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        album_id: {
          allowNull: false,
          notEmpty: true,
          type: Sequelize.INTEGER
        },
        album_title: {
          allowNull: false,
          notEmpty: true,
          type: Sequelize.STRING
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      },
      {
        indexes: [
          {
            unique: true,
            fields: ['user_id', 'album_id']
          }
        ]
      }
    ),
  down: queryInterface => queryInterface.dropTable('albums_by_user')
};
