const { db, ObjectID } = require('./db')
const marked = require('../lib/marked')
const { JSDOM } = require('jsdom')
const COLLECTION_NAME = 'posts'
const SENTENCE_ENDS = /[.:,.;~![\]{}()?"'：”、，。；！？……\s]/

function Post ({ name, avatar, title, tags, post }) {
  this.name = name
  this.avatar = avatar
  this.title = title
  this.tags = tags
  this.post = post
}

async function makeSummary (content) {
  let min = 300
  let theta = 20
  let dom = new JSDOM(await marked(content))
  let summary = dom.window.document.body.textContent
  if (summary.length > min) {
    let stop = summary.substring(min - theta, min + theta).search(SENTENCE_ENDS)
    summary = stop !== -1 ? summary.substring(0, min - theta + stop) : summary.substring(0, min)
    summary = summary.trim() + ' …'
  }
  return summary
}

// 存储各种时间格式，方便以后扩展
function makeTime (date = new Date()) {
  return {
    date,
    year: date.getFullYear(),
    month: date.getFullYear() + '/' + (date.getMonth() + 1),
    day: date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate(),
    minute: date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
  }
}

// 存储一篇文章及其相关信息
Post.prototype.save = async function () {
  let time = makeTime()
  // 要存入数据库的文档
  let summary = await makeSummary(this.post)
  let post = {
    name: this.name,
    avatar: this.avatar,
    time: time,
    title: this.title,
    tags: this.tags,
    post: this.post,
    summary: summary,
    comments: [],
    reprint: {},
    pv: 0 // 浏览量
  }

  let r
  try {
    await db.open()
    let col = db.collection(COLLECTION_NAME)
    r = await col.insertOne(post, {
      safe: true
    })
  } catch (e) {
    throw e
  } finally {
    await db.close()
  }
  return r
}

Post.getByPage = async function ({ name, page, itemsPerPage = 8 }) {
  let posts, total
  let query = name ? { name } : {}
  try {
    await db.open()
    let col = db.collection(COLLECTION_NAME)
    total = await col.count(query)
    posts = await col.find(query).sort({ time: -1 }).toArray()

    posts.map(async post => {
      post.post = await marked(post.post)
      return post
    })
  } catch (e) {
    throw e
  } finally {
    await db.close()
  }
  return { posts, total }
}

Post.getById = async function ({ id }) {
  let r
  try {
    let _id = new ObjectID(id)
    let data = {
      'pv': 1
    }

    await db.open()

    let col = db.collection(COLLECTION_NAME)
    // update page view count
    r = await col.findOneAndUpdate({ _id }, { $inc: data })

    // markdownify post content
    r.value.post = await marked(r.value.post)

    // markdownify comments content
    let commentPromises = []
    for (let comment of r.value.comments) {
      commentPromises.push(marked(comment.content))
    }
    r.value.comments = await Promise.all(commentPromises)
  } catch (e) {
    throw e
  } finally {
    await db.close()
  }
  return r.value
}

Post.edit = async function ({ id }) {
  let r
  let _id = new ObjectID(id)
  try {
    await db.open()
    r = await db.collection(COLLECTION_NAME).findOne({ _id })
  } catch (e) {
    throw (e)
  } finally {
    await db.close()
  }
  return r
}

Post.update = async function ({ id, title, tags, post }) {
  let r
  let _id = new ObjectID(id)
  let summary = await makeSummary(post)
  let data = { title, tags, post, summary }

  try {
    await db.open()
    let col = db.collection(COLLECTION_NAME)
    r = await col.findOneAndUpdate({ _id }, { '$set': data })
  } catch (e) {
    throw (e)
  } finally {
    await db.close()
  }
  return r
}

Post.remove = async function ({ id }) {
  let r
  let _id = new ObjectID(id)

  try {
    await db.open()
    let col = db.collection(COLLECTION_NAME)
    let r = await col.findOneAndDelete({ _id })
    // update reprint info
    if (r.reprint && r.reprint.from) {
      let _id = new ObjectID(r.reprint.from.id)
      let data = { 'reprint.to': { id } }
      await col.findOneAndUpdate({ _id }, { '$pull': data })
    }
  } catch (e) {
    throw (e)
  } finally {
    await db.close()
  }
  return r
}

// 返回所有文章的存档信息
Post.getArchive = async function () {
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
  } catch (e) {
    throw (e)
  } finally {
    await db.close()
  }
  return r
}

// 获取标签
// TODO: 标签可以有多个
Post.getTags = async function () {
  let r
  try {
    await db.open()
    r = await db.collection(COLLECTION_NAME).distinct('tags')
  } catch (e) {
    throw (e)
  } finally {
    await db.close()
  }
  return r
}

// 获取含有指定标签的所有文章
// TODO: tags 是个数组
Post.getByTag = async function ({ tag }) {
  let r
  try {
    await db.open()
    r = await db.collection(COLLECTION_NAME).find({ 'tags': tag })
                .sort({ 'time': -1 }).toArray()
  } catch (e) {
    throw (e)
  } finally {
    await db.close()
  }
  return r
}

// 搜索
Post.search = async function ({ keyword }) {
  let r
  let pattern = new RegExp('^.*(' + keyword.trim().split(/\s+/).join('|') + ').*$', 'i')
  let query = {
    'title': pattern
  }
  try {
    await db.open()
    r = await db.collection(COLLECTION_NAME).find(query)
                .sort({ 'time': -1 }).toArray()
  } catch (e) {
    throw (e)
  } finally {
    await db.close()
  }
  return r
}

// 转载
Post.reprint = async function ({ from, to }) {
  let r
  let id = from.id
  let _id = new ObjectID(id)
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
    r = await col.insetOne(copy, { 'safe': true })

    // 更新被转发的博客的信息
    let data = {
      'reprint.to': {
        'id': r._id.toString(),
        'name': r.name
      }
    }
    await col.findOneAndUpdate({ _id }, { '$push': data })
  } catch (e) {
    throw (e)
  } finally {
    await db.close()
  }
  return r
}

module.exports = Post
