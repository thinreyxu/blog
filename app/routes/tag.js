module.exports = (Post) => {
  async function tags (req, res, next) {
    try {
      let tags = await Post.getTags()
      res.render('tags', {
        title: '标签',
        tags
      })
    } catch (e) {
      req.flash('error', '无法读取标签')
      next()
    }
  }

  async function tag (req, res, next) {
    try {
      let tag = req.params.tag
      let posts = await Post.getByTag({ tag })
      res.render('tag', {
        title: `标签：${tag}`,
        posts
      })
    } catch (e) {
      req.flash('error', '无法获取文章')
      next()
    }
  }

  return [
    [ '/tags', 'get', [ tags ] ],
    [ '/tag/:tag', 'get', [ tag ] ]
  ]
}
module.exports['@singletong'] = true
module.exports['@require'] = [ 'modelsOld/post' ]
