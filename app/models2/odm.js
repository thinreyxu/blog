module.exports = (mongoose, settings) => {
  const { dbName, dbHost, dbPort, dbUser, dbPwd, dbAuth } = settings
  const CONNECT_STRING = `mongodb://${dbUser}:${dbPwd}@${dbHost}:${dbPort}/${dbName}?authSource=${dbAuth}`
  mongoose.Promise = global.Promise
  mongoose.connect(CONNECT_STRING, { useMongoClient: true }).catch(console.error)
  return mongoose
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'mongoose', 'settings' ]
