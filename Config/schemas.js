const { Schema } = require("mongoose");

exports.urlSchema = new Schema({
  _id: String,
  redirect_uri: String,
  ip: String,
  flagged: Boolean,
  comments: String,
  created_at: Number
}, {
  _id: false,
  versionKey: false
});