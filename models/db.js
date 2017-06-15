const settings = require('../settings')
    , {db_name, db_host, db_port} = settings
    , MongoDB = require('mongodb')
    , Db = MongoDB.Db
    , Server = MongoDB.Server
    , mongodb = new Db(db_name, new Server(db_host, db_port));

exports.ObjectID = MongoDB.ObjectID;
exports.mongodb = mongodb;

exports.close = () => mongodb.close();

exports.collection = (name, callback) => {
  mongodb.open((err, db) => {
    if (err) { return callback(err); }
    db.collection(name, (err, collection) => callback(err, collection))
  })
}
