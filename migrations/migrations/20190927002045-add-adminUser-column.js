'use strict';

module.exports = {
  up: (queryInterface, SEQUELIZE) =>
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn('users', 'is_admin', { type: SEQUELIZE.BOOLEAN, defaultValue: false })
};
