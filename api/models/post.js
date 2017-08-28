module.exports = (odm, Comment) => {
  const postSchema = new odm.Schema({
    name: { type: String, required: true },
    ctime: { type: Date, default: Date.now, required: true },
    utimes: [{ type: Date, default: Date.now }],
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, required: true },
    tags: [{ type: String }],
    comments: [{ type: Comment.schema }], // newest 10 comment
    pv: { type: Number, default: 0 },
    titleSearch: [{ type: String, index: true, required: true }]
  })

  // postSchema.index({ title: 'text', content: 'text', tags: 'text' })

  postSchema.query.page = function (page, itemsPerPage = 10) {
    return this.find().skip((page - 1) * itemsPerPage).limit(itemsPerPage)
  }

  // postSchema.query.search = function (keywords) {
  //   return this.find(
  //     { $text: { $search: keywords } }
  //   ).select(
  //     { score: { $meta: 'textScore' } }
  //   ).sort({
  //     score: { $meta: 'textScore' }
  //   })
  // }

  postSchema.query.search = function (keywords) {
    let keywordsArray = keywords.trim().replace(/\s+/g, ' ')
    return this.find({ titleSearch: { $all: keywordsArray } })
  }

  postSchema.query.groupByYear = function () {
  }

  const Post = odm.model('Post', postSchema, 'posts')

  return Post
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/odm', 'models/comment' ]
