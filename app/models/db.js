module.exports = (settings, mongodb) => {
  const { dbName, dbHost, dbPort, dbUser, dbPwd, dbAuth } = settings
  const { ObjectID, MongoClient } = mongodb
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

  return { ObjectID, DBC, CONNECT_STRING }
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'settings', 'mongodb' ]
