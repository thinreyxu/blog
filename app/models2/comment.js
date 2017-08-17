module.exports = (odm) => {
  const commentSchema = odm.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: true },
    ctime: { type: Date, required: true },
    content: { type: String, required: true },
    post: { type: String, required: true }, // post id
    pro: { type: Number, default: 0, min: 0 },
    con: { type: Number, default: 0, min: 0 }
  })

  const Comment = odm.model('Comment', commentSchema, 'comments')

  return Comment
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/odm' ]
