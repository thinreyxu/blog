const common = require('./common')
const { makeAvatar } = require('../lib/avatar')
const { makeTime } = require('../lib/time')
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')

function doComment (req, res) {
  let time = makeTime()
  let avatar = makeAvatar(req.body.email)

  var comment = {
    name: req.body.name,
    avatar,
    email: req.body.email,
    website: req.body.website,
    content: req.body.content,
    time
  }

  var newComment = new Comment(req.params.id, comment)
  newComment.save(function (err) {
    if (err) {
      req.flash('error', err)
      return res.redirect(req.url)
    }
    req.flash('success', '留言成功！')
    res.redirect('p/' + req.params.id)
  })
}

module.exports = [
  [ '/comment/:id', 'post', [ doComment ] ]
]
