const Comment = require('../models/comment')

async function doComment (req, res) {
  try {
    let comment = new Comment({
      name: req.body.name,
      email: req.body.email,
      website: req.body.website,
      content: req.body.content,
      post: req.params.postId
    })
    await comment.save()
    req.flash('success', '评论成功！')
    res.redirect('p/' + req.params.postId)
  } catch (e) {
    req.flash('error', '无法评论')
    res.redirect('p/' + req.params.postId)
  }
}

module.exports = [
  [ '/comment/:postId', 'post', [ doComment ] ]
]
