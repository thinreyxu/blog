const { db, ObjectId } = require('./db')
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
  //   this._id = new ObjectId(id)
  // }

  // 存储一篇文章及其相关信息
  async save () {
    try {
      this.summary = this.summary || await makeSummary(this.content)
      await db.open()
      await db.collection(COLLECTION_NAME).insertOne(this, { w: 1 })
    } catch (e) { throw e } finally { await db.close() }
    return this
  }

  static async getByPage ({ name, page = 1, itemsPerPage = 8 }) {
    let posts, total
    try {
      await db.open()
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
    let r
    try {
      let _id = new ObjectId(id)
      await db.open()
      // update page view count
      r = await db.collection(COLLECTION_NAME)
          .findOne({ _id })
      // markdownify post content
      r.content = await makeMd(r.content)
    } catch (e) { throw e } finally { await db.close() }
    return r
  }

  static async incPageView ({ id }) {
    try {
      let _id = ObjectId(id)
      await db.open()
      await db.collection(COLLECTION_NAME)
        .updateOne({ _id }, { $inc: { 'pv': 1 } })
    } catch (e) { throw e } finally { await db.close() }
  }

  static async edit ({ id }) {
    let r
    let _id = new ObjectId(id)
    try {
      await db.open()
      r = await db.collection(COLLECTION_NAME).findOne({ _id })
    } catch (e) { throw (e) } finally { await db.close() }
    return r
  }

  static async update ({ id, title, tags, post }) {
    try {
      let _id = new ObjectId(id)
      let summary = await Post.makeSummary(post)
      let data = { title, tags, post, summary }
      await db.open()
      await db.collection(COLLECTION_NAME)
          .updateOne({ _id }, { '$set': data })
    } catch (e) { throw (e) } finally { await db.close() }
  }

  static async remove ({ id }) {
    try {
      let _id = new ObjectId(id)
      await db.open()
      let col = db.collection(COLLECTION_NAME)
      let { value: post } = await col.findOneAndDelete({ _id })
      // update reprint info
      if (post.reprint && post.reprint.from) {
        let _id = new ObjectId(post.reprint.from.id)
        let data = { 'reprint.to': { id } }
        await col.findOneAndUpdate({ _id }, { '$pull': data })
      }
    } catch (e) { throw (e) } finally { await db.close() }
  }

  // 返回所有文章的存档信息
  static async getArchive () {
    let r = {}
    try {
      await db.open()
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
    let r
    try {
      await db.open()
      r = await db.collection(COLLECTION_NAME).distinct('tags')
    } catch (e) { throw (e) } finally { await db.close() }
    return r
  }

  // 获取含有指定标签的所有文章
  // TODO: tags 是个数组
  static async getByTag ({ tag }) {
    let r
    try {
      await db.open()
      r = await db.collection(COLLECTION_NAME).find({ 'tags': tag })
                  .sort({ 'time': -1 }).toArray()
    } catch (e) { throw (e) } finally { await db.close() }
    return r
  }

  // 搜索
  static async search ({ keyword }) {
    let r
    let pattern = new RegExp('^.*(' + keyword.trim().split(/\s+/).join('|') + ').*$', 'i')
    let query = {
      'title': pattern
    }
    try {
      await db.open()
      r = await db.collection(COLLECTION_NAME).find(query)
                  .sort({ 'time': -1 }).toArray()
    } catch (e) { throw (e) } finally { await db.close() }
    return r
  }

  // 转载
  static async reprint ({ from, to }) {
    let r
    let id = from.id
    let _id = new ObjectId(id)
    try {
      await db.open()
      let col = db.collection(COLLECTION_NAME)

      // 存储新博客
      let origin = await col.findOne({ _id })
      let copy = Object.assign({}, origin, {
        'name': to.name,
        'avatar': to.avatar,
        'time': makeTime(new Date()),
        'title': (origin.title.search(/[转载]/) > -1) ? origin.title : '[转载]' + origin.title,
        'comment': [],
        'reprint': {
          from
        },
        'pv': 0
      })
      Reflect.deleteProperty(copy, '_id')
      let { result, ops: [ value ] } = await col.insetOne(copy)
      if (result.ok !== 1) throw new Error('插入转发文章失败！')
      r = value
      // 更新被转发的博客的信息
      let data = {
        'reprint.to': {
          'id': r._id.toString(),
          'name': r.name
        }
      }
      await col.findOneAndUpdate({ _id }, { '$push': data })
    } catch (e) { throw (e) } finally { await db.close() }
    return r
  }

}

module.exports = Post
