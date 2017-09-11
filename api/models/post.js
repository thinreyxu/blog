module.exports = (odm, Comment) => {
  const postSchema = new odm.Schema({
    name: { type: String, required: true },
    ctime: { type: Date, default: Date.now, index: true, required: true },
    utimes: [{ type: Date, default: Date.now }],
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, required: true },
    tags: [{ type: String, index: true }],
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

  postSchema.statics.search = function (keywords) {
    let keywordsArray = keywords.trim().replace(/\s+/g, ' ')
    return this.find({ titleSearch: { $all: keywordsArray } })
  }

  postSchema.statics.groupByYear = function () {
    return this.aggregate([
      {
        $project: {
          year: { $year: '$ctime' },
          month: { $month: '$ctime' },
          post: '$$CURRENT',
          _id: 1,
          title: 1
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          count: { $sum: 1 },
          posts: { $addToSet: { _id: '$_id', title: '$title' } }
        }
      },
      {
        $addFields: {
          _id: null,
          year: '$_id.year',
          month: '$_id.month'
        }
      }
    ])
  }

  const Post = odm.model('Post', postSchema, 'posts')

  return Post
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/odm', 'models/comment' ]
