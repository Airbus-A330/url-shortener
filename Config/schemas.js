const { DataTypes } = require('sequelize');

exports.Url = {
  _id: DataTypes.STRING,
  redirect_uri: DataTypes.STRING,
  ip: DataTypes.STRING,
  flagged: DataTypes.BOOLEAN,
  comments: DataTypes.STRING
};