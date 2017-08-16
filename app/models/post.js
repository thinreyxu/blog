const { DBC, ObjectID } = require('./db')
const { makeMd, makeSummary } = require('../lib/marked')
const { makeTime } = require('../lib/time')
const COLLECTION_NAME = 'posts'

class Post {

  constructor (postObj) {
    /*
    postObj = {
      name,
      avatar,
      time,
      title,
      tags,
      content,
      summary,
      - comments,
      reprint,
      pv // 浏览量
    }
    */
    Object.assign(this, postObj)
    // this.comments = this.comments || []
    this.tags = this.tags || []
    this.reprint = this.reprint || {}
    this.pv = this.pv || 0
    this.time = this.time || makeTime()
  }

  // get id () {
  //   return this._id.toString()
  // }
  //
  // set id (id) {
  //   this._id = new ObjectID(id)
  // }

  // 存储一篇文章及其相关信息
  async save () {
    let db
    try {
      this.summary = this.summary || await makeSummary(this.content)
      db = await DBC.connect()
      await db.collection(COLLECTION_NAME).insertOne(this, { w: 1 })
    } catch (e) { throw e } finally { await db.close() }
    return this
  }

  static async getByPage ({ name, page = 1, itemsPerPage = 8 }) {
    let db, posts, total
    try {
      db = await DBC.connect()
      let col = db.collection(COLLECTION_NAME)
      let query = name ? { name } : {}
      total = await col.count(query)
      posts = await col.find(query)
        .sort({ time: -1 })
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .toArray()

      // posts.map(async post => {
      //   post.content = await makeMd(post.content)
      //   return post
      // })
    } catch (e) { throw e } finally { await db.close() }
    return { posts, total }
  }

  static async getById ({ id }) {
    let r, db
    try {
      let _id = new ObjectID(id)
      db = await DBC.connect()
      // update page view count
      r = await db.collection(COLLECTION_NAME)
          .findOne({ _id })
      // markdownify post content
      r.content = await makeMd(r.content)
    } catch (e) { throw e } finally { await db.close() }
    return r
  }

  static async incPageView ({ id }) {
    let db
    try {
      let _id = new ObjectID(id)
      db = await DBC.connect()
      await db.collection(COLLECTION_NAME)
        .updateOne({ _id }, { '$inc': { 'pv': 1 } })
    } catch (e) { throw e } finally { await db.close() }
  }

  static async edit ({ id }) {
    let r, db
    let _id = new ObjectID(id)
    try {
      db = await DBC.connect()
      r = await db.collection(COLLECTION_NAME).findOne({ _id })
    } catch (e) { throw (e) } finally { await db.close() }
    return r
  }

  static async update ({ id, title, tags, post }) {
    let db
    try {
      let _id = new ObjectID(id)
      let summary = await Post.makeSummary(post)
      let data = { title, tags, post, summary }
      db = await DBC.connect()
      await db.collection(COLLECTION_NAME)
          .updateOne({ _id }, { '$set': data })
    } catch (e) { throw (e) } finally { await db.close() }
  }

  static async remove ({ id }) {
    let db
    try {
      db = await DBC.connect()
      let col = db.collection(COLLECTION_NAME)
      let _id = new ObjectID(id)
      let { value: post } = await col.findOneAndDelete({ _id })
      // update reprint info
      if (post.reprint && post.reprint.from) {
        let from = post.reprint.from._id
        let data = { 'reprint.to': { _id } }
        await col.updateOne({ _id: from }, { '$pull': data })
      }
    } catch (e) { throw (e) } finally { await db.close() }
  }

  // 返回所有文章的存档信息
  static async getArchive () {
    let r = {}
    let db
    try {
      db = await DBC.connect()
      let col = db.collection(COLLECTION_NAME)
      let years = await col.distinct('time.year')
      years.sort().reverse()
      let option = {
        'fields': {
          'title': 1,
          'time': 1
        }
      }
      let queryPromises = []
      for (let year of years) {
        let promise = col.find({ 'time.year': year }, option)
                          .sort({ 'time': -1 }).toArray()
        queryPromises.push(promise)
      }
      let queryResults = await Promise.all(queryPromises)
      for (let i = 0; i < queryResults.length; i++) {
        r[years[i]] = queryResults[i]
      }
    } catch (e) { throw (e) } finally { await db.close() }
    return r
  }

  // 获取标签
  // TODO: 标签可以有多个
  static async getTags () {
    let r, db
    try {
      db = await DBC.connect()
      r = await db.collection(COLLECTION_NAME)
        .distinct('tags')
    } catch (e) { throw (e) } finally { await db.close() }
    return r
  }

  // 获取含有指定标签的所有文章
  // TODO: tags 是个数组
  static async getByTag ({ tag }) {
    let r, db
    try {
      db = await DBC.connect()
      r = await db.collection(COLLECTION_NAME)
        .find({ 'tags': tag })
        .sort({ 'time': -1 })
        .toArray()
    } catch (e) { throw (e) } finally { await db.close() }
    return r
  }

  // 搜索
  static async search ({ keyword }) {
    let r, db
    let pattern = new RegExp('^.*(' + keyword.trim().split(/\s+/).join('|') + ').*$', 'i')
    let query = {
      'title': pattern
    }
    try {
      db = await DBC.connect()
      r = await db.collection(COLLECTION_NAME).find(query)
                  .sort({ 'time': -1 }).toArray()
    } catch (e) { throw (e) } finally { await db.close() }
    return r
  }

  // 转载
  static async reprint ({ from, to }) {
    let r, db
    try {
      db = await DBC.connect()
      let col = db.collection(COLLECTION_NAME)
      // 存储新博客
      let _id = new ObjectID(from.id)
      let origin = await col.findOne({ _id })
      let copy = Object.assign({}, origin, {
        'name': to.name,
        'avatar': to.avatar,
        'time': makeTime(new Date()),
        'title': (origin.title.search(/[转载]/) === 0) ? origin.title : `[转载]${origin.title}`,
        'reprint': {
          from: { _id }
        },
        'pv': 0
      })
      Reflect.deleteProperty(copy, '_id')
      let { result, ops: [ value ] } = await col.insertOne(copy)
      if (result.ok !== 1) throw new Error('插入转发文章失败！')
      r = value
      // 更新被转发的博客的信息

      let data = {
        'reprint.to': { _id: r._id }
      }
      await col.updateOne({ _id }, { '$push': data })
    } catch (e) { console.log(e); throw e } finally { await db.close() }
    return r
  }

}

module.exports = Post
