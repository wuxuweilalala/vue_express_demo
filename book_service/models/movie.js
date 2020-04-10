var mongoose = require('../common/db');

var movie = new mongoose.Schema({
  _id: String,
  movieNumSuppose: String,
})

movie.statics.findById = function (m_id, callBack) {
  this.find({ _id: m_id, movieNumSuppose: '0' }, callBack)
}

movie.statics.findAll = function (callBack) {
  this.find({}, callBack)
}

var movieModel = mongoose.model('movie', movie);
module.exports = movieModel;