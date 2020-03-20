'use strict';
module.exports = (sequelize, DataTypes) => {
  const Moderator = sequelize.define('Moderator', {
    name: DataTypes.STRING
  }, {});
  Moderator.associate = function(models) {
    // associations can be defined here
  };
  return Moderator;
};