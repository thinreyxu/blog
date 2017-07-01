const { db, ObjectId } = require('./db')
const { makeMd } = require('../lib/marked')
const { makeAvatar } = require('../lib/avatar')
const { makeTime } = require('../lib/time')
const COLLECTION_NAME = 'comments'

class Comment {
  constructor (commentObj) {
    /*
    commentObj = {
      name, email, avatar, time, content,
      post, // 文章 id
      pro, // 赞
      con // 踩
    }
    */
    Object.assign(this, commentObj)
    this.avatar = this.avatar || makeAvatar(this.email)
    this.time = this.time || makeTime()
    this.pro = this.pro || 0
    this.con = this.con || 0
  }

  // 存储一条留言信息
  async save () {
    try {
      await db.open()
      await db.collection(COLLECTION_NAME).insertOne(this, { w: 1 })
    } catch (e) { throw e } finally { await db.close() }
    return this
  }

  static async getById ({ id }) {
    let r
    try {
      await db.open()
      let _id = new ObjectId(id)
      let comment = await db.collection(COLLECTION_NAME).find({ _id })
      if (comment.content) {
        comment.content = await makeMd(comment.content)
      }
      r = comment
    } catch (e) { throw e } finally { await db.close() }
    return r
  }

  // static async getByIds ({ ids }) {
  //   let r
  //   try {
  //     await db.open()
  //     let _ids = ids.map(id => new ObjectId(id))
  //     let comments = await db.collection(COLLECTION_NAME)
  //         .find({ _id: { '$in': _ids } })
  //         .sort({ time: -1 }).toArray()
  //     let contentPromises = []
  //     for (let comment of comments) {
  //       contentPromises.push(makeMd(comment.content))
  //     }
  //     let contents = await Promise.all(contentPromises)
  //     for (let [index, content] of contents.entries()) {
  //       comments[index].content = content
  //     }
  //     r = comments
  //   } catch (e) { throw e } finally { await db.close() }
  //   return r
  // }

  static async getByPost ({ post }) {
    let r
    try {
      await db.open()
      let _id = new ObjectId(post)
      let comments = await db.collection(COLLECTION_NAME)
          .find({ post: _id })
          .sort({ time: -1 }).toArray()
      let contentPromises = []
      for (let comment of comments) {
        contentPromises.push(makeMd(comment.content))
      }
      let contents = await Promise.all(contentPromises)
      for (let [index, value] of contents.entries()) {
        comments[index].content = value
      }
      r = comments
    } catch (e) { throw e } finally { await db.close() }
    return r
  }

  static async removeById ({ id }) {
    let r
    try {
      await db.open()
      let _id = new ObjectId(id)
      r = await db.collection(COLLECTION_NAME)
          .findOneAndDelete({ _id })
    } catch (e) { throw e } finally { await db.close() }
    return r.value
  }
}

module.exports = Comment
