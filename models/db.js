var settings = require('../settings')
  , MongoDB = require('mongodb')
  , Db = MongoDB.Db
  , Connection = MongoDB.Connection
  , Server = MongoDB.Server;

exports.ObjectID = MongoDB.ObjectID;

var mongodb = new Db(
  settings.db,
  new Server(settings.host, Connection.DEFAULT_PORT, {}),
  { safe: true }
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
  
