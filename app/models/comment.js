module.exports = (db, marked, avatar, time) => {
  const { DBC, ObjectID } = db
  const { makeMd } = marked
  const { makeAvatar } = avatar
  const { makeTime } = time
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
      this.post = new ObjectID(this.post)
      this.avatar = this.avatar || makeAvatar(this.email)
      this.time = this.time || makeTime()
      this.pro = this.pro || 0
      this.con = this.con || 0
    }

    // 存储一条留言信息
    async save () {
      let db
      try {
        db = await DBC.connect()
        await db.collection(COLLECTION_NAME).insertOne(this, { w: 1 })
      } catch (e) { throw e } finally { await db.close() }
      return this
    }

    static async getById ({ id }) {
      let r, db
      try {
        db = await DBC.connect()
        let _id = new ObjectID(id)
        let comment = await db.collection(COLLECTION_NAME).find({ _id })
        if (comment.content) {
          comment.content = await makeMd(comment.content)
        }
        r = comment
      } catch (e) { throw e } finally { await db.close() }
      return r
    }

    static async getByPost ({ post }) {
      let r, db
      try {
        db = await DBC.connect()
        let _id = new ObjectID(post)
        let comments = await db.collection(COLLECTION_NAME)
            .find({ post: _id })
            .sort({ time: -1 })
            .toArray()
        if (comments && comments.length) {
          let contentPromises = []
          for (let comment of comments) {
            contentPromises.push(makeMd(comment.content))
          }
          let contents = await Promise.all(contentPromises)
          for (let [index, value] of contents.entries()) {
            comments[index].content = value
          }
        }
        r = comments
      } catch (e) { throw e } finally { await db.close() }
      return r
    }

    static async removeById ({ id }) {
      let db
      try {
        db = await DBC.connect()
        let _id = new ObjectID(id)
        await db.collection(COLLECTION_NAME)
            .deleteOne({ _id })
      } catch (e) { throw e } finally { await db.close() }
    }

    static async removeByPost ({ post }) {
      let db
      try {
        db = await DBC.connect()
        let _id = new ObjectID(post)
        await db.collection(COLLECTION_NAME)
            .deleteMany({ post: _id })
      } catch (e) { throw e } finally { await db.close() }
    }
  }

  return Comment
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'modelsOld/db', 'lib/marked', 'lib/avatar', 'lib/time' ]
