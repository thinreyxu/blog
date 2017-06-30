const { db } = require('./db')
const crypto = require('crypto')

const COLLECTION_NAME = 'users'

function User ({ name, password, email }) {
  this.name = name
  this.password = password
  this.email = email
}

module.exports = User

// 存储用户信息
User.prototype.save = async function (callback) {
  let md5 = crypto.createHash('md5')
  let emailMd5 = md5.update(this.email.toLowerCase()).digest('hex')
  let avatar = `http://www.gravatar.com/avatar/${emailMd5}?s=48&d=https%3A%2F%2Fidenticons.github.com%2F3632892525abab630a972bc0a368853c.png?s=40`
  // 要存入数据库的用户文档
  let user = {
    name: this.name,
    password: this.password,
    email: this.email,
    avatar
  }
  try {
    await db.open()
    await db.collection(COLLECTION_NAME).insertOne(user, { 'safe': true })
  } catch (e) { throw e } finally { await db.close() }
  return this
}

// 读取用户信息
User.get = async function ({ name }) {
  let r
  try {
    await db.open()
    r = await db.collection(COLLECTION_NAME).findOne({ name })
  } catch (e) { throw e } finally { await db.close() }
  return r
}
