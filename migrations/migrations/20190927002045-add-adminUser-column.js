'use strict';

module.exports = {
  up: (queryInterface, SEQUELIZE) =>
    queryInterface.addColumn('users', 'role', { type: SEQUELIZE.STRING, defaultValue: '' })
};
