module.exports = (Comment, Post, avatar, settings) => {
  const { makeAvatar } = avatar
  const { commentsPerPage } = settings

  async function doComment (req, res) {
    try {
      let comment = await Comment.create({
        name: req.body.name,
        email: req.body.email,
        avatar: await makeAvatar(req.body.email),
        content: req.body.content,
        post: req.params.postId
      })
      await Post.updateOne({ _id: req.params.postId }, {
        $push: {
          comments: {
            $each: [ comment ],
            $position: 0,
            $slice: commentsPerPage,
            $sort: { ctime: -1 }
          }
        }
      })
      req.flash('success', '评论成功！')
      res.redirect(`/p/${req.params.postId}`)
    } catch (e) {
      req.flash('error', '无法评论')
      res.redirect(`/p/${req.params.postId}`)
    }
  }

  return [
    [ '/comment/:postId', 'post', [ doComment ] ]
  ]
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/comment', 'models/post', 'lib/avatar', 'settings' ]
