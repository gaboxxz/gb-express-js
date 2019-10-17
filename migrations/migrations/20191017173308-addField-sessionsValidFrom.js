'use strict';

module.exports = {
  up: (queryInterface, SEQUELIZE) =>
    queryInterface.addColumn('users', 'sessions_valid_from', { type: SEQUELIZE.DATE, defaultValue: null })
};
