const {db_name, db_host, db_port} = require('../settings')
    , {ObjectID, Db, Server, MongoClient} = require('mongodb')
    , server = new Server(db_host, db_port);
    , db = new Db(db_name, server);

module.exports = {ObjectID, db}
