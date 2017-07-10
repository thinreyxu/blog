const { db_name, db_host, db_port, db_user, db_pwd } = require('../settings')
const { ObjectID, MongoClient } = require('mongodb')
// const server = new Server(db_host, db_port)
// const db = new Db(db_name, server)
const CONNECT_STRING = `mongodb://${db_user}:${db_pwd}@${db_host}:${db_port}/${db_name}`

class DBC extends MongoClient {
  connect () {
    return super.connect(CONNECT_STRING)
  }
  static connect () {
    return super.connect(CONNECT_STRING)
  }
}

module.exports = {ObjectID, DBC, CONNECT_STRING}
