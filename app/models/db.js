const { dbName, dbHost, dbPort, dbUser, dbPwd, dbAuth } = require('../settings')
const { ObjectID, MongoClient } = require('mongodb')
// const server = new Server(db_host, db_port)
// const db = new Db(db_name, server)
const CONNECT_STRING = `mongodb://${dbUser}:${dbPwd}@${dbHost}:${dbPort}/${dbName}?authSource=${dbAuth}`
class DBC extends MongoClient {
  connect () {
    return super.connect(CONNECT_STRING)
  }
  static connect () {
    return super.connect(CONNECT_STRING)
  }
}

module.exports = {ObjectID, DBC, CONNECT_STRING}
