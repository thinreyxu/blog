var settings = require('../settings')
  , Db = require('mongodb').Db
  , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server;

var mongodb = new Db(
  settings.db,
  new Server(settings.host, Connection.DEFAULT_PORT, {}),
  { w: 1 }
);

exports.mongodb = mongodb;

exports.close = function () {
  mongodb.close();
};

exports.collection = function (name, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }

    db.collection(name, function (err, collection) {
      callback(err, collection);
    })
  })
}
  
