// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Se configura un modelo en mongoose y se pasa usando el exports
module.exports = mongoose.model('User', new Schema({
  name: String,
  password: String,
  admin: Boolean
}));
