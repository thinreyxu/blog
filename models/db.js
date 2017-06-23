const {db_name, db_host, db_port} = require('../settings');
const {ObjectID, Db, Server, MongoClient} = require('mongodb');
const server = new Server(db_host, db_port);
const db = new Db(db_name, server);

module.exports = {ObjectID, db}
