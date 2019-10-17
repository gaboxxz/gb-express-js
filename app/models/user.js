'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    'user',
    {
      firstName: { type: DataTypes.STRING, allowNull: false, field: 'first_name' },
      lastName: { type: DataTypes.STRING, allowNull: false, field: 'last_name' },
      password: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      role: { type: DataTypes.STRING, field: 'role', defaultValue: '' },
      sessionsValidFrom: { type: DataTypes.DATE, field: 'sessions_valid_from', defaultValue: null }
    },
    { underscored: true }
  );
  // user.associate = models => {
  // associations can be defined here
  // };
  return user;
};
