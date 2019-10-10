'use strict';
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('albums_by_user', {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        notEmpty: true,
        references: {
          model: 'users',
          key: 'id'
        },
        primaryKey: true
      },
      album_id: {
        allowNull: false,
        notEmpty: true,
        type: Sequelize.INTEGER,
        primaryKey: true
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
    }),
  down: queryInterface => queryInterface.dropTable('albums_by_user')
};
