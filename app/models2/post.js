module.exports = (odm, Comment) => {
  const postSchema = odm.Schema({
    name: { type: String, required: true },
    ctime: { type: Date, default: Date.now, required: true },
    utime: [ Date ],
    title: { type: String, required: true },
    tags: [ String ],
    content: { type: String, required: true },
    summary: { type: String, required: true },
    comments: [ Comment.schema ], // newest 10 comment
    pv: Number
  })

  const Post = odm.model('Post', postSchema, 'posts')

  return Post
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/odm', 'models/comment' ]
