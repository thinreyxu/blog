module.exports = (odm) => {
  const commentSchema = odm.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: true },
    ctime: { type: Date, default: Date.now, required: true },
    content: { type: String, required: true },
    post: { type: odm.Schema.Types.ObjectId, ref: 'Post', required: true }, // post id
    pro: { type: Number, default: 0, min: 0 },
    con: { type: Number, default: 0, min: 0 }
  })

  commentSchema.query.page = function (page, itemsPerPage = 10) {
    return this.find().skip((page - 1) * itemsPerPage).limit(itemsPerPage)
  }

  const Comment = odm.model('Comment', commentSchema, 'comments')

  return Comment
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/odm' ]
