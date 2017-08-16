const { DBC } = require('./db')
const { makeAvatar } = require('../lib/avatar')
const { makeTime } = require('../lib/time')

const COLLECTION_NAME = 'users'

class User {

  constructor (userObj) {
    /*
    userObj = {
      name, password, email, avatar, time
    }
    */
    Object.assign(this, userObj)
    this.avatar = this.avatar || makeAvatar(this.email)
    this.time = this.time || makeTime()
  }

  // 存储用户信息
  async save () {
    let db
    try {
      db = await DBC.connect()
      await db.collection(COLLECTION_NAME).insertOne(this, { w: 1 })
    } catch (e) { throw e } finally { await db.close() }
    return this
  }

  // 根据用户名读取用户信息
  static async getByName ({ name }) {
    let r, db
    try {
      db = await DBC.connect()
      r = await db.collection(COLLECTION_NAME).findOne({ name })
    } catch (e) { throw e } finally { await db.close() }
    return r
  }

  static async getByEmail ({ email }) {
    let r, db
    try {
      db = await DBC.connect()
      r = await db.collection(COLLECTION_NAME).findOne({ email })
    } catch (e) { throw e } finally { await db.close() }
    return r
  }
}

module.exports = User
