module.exports = (Post, Comment, common, marked, settings, jieba) => {
  const { checkLogin } = common
  const { makeSummary } = marked
  const { commentsPerPage } = settings

  function compose (req, res) {
    res.render('compose', { title: '发表' })
  }

  async function doCompose (req, res) {
    try {
      let tags = req.body.tags.trim()
      if (tags) {
        tags = tags.split(',').map(tag => tag.trim())
      } else {
        tags = []
      }

      let post = await Post.create({
        name: req.session.user.name,
        avatar: req.session.user.avatar,
        title: req.body.title,
        content: req.body.content,
        summary: await makeSummary(req.body.content),
        tags,
        titleSearch: jieba.cut(req.body.title)
      })
      req.flash('success', '发布成功！')
      res.redirect(`/p/${post._id.toString()}`)
    } catch (e) {
      req.flash('error', '无法发布博客')
      return res.redirect('back')
    }
  }

  async function post (req, res, next) {
    try {
      let page = Math.max(req.query.p ? Number.parseInt(req.query.p) : 1)
      let post = await Post.findOneAndUpdate({ _id: req.params.id }, { $inc: { pv: 1 } })
      let total = await Comment.find().count()
      let comments = post.comments
      if (page !== 1) {
        comments = await Comment.find().sort({ ctime: -1 }).page(page, commentsPerPage)
      }
      res.render('post', {
        title: post.title,
        post,
        comments,
        page,
        isFirstPage: page === 1,
        isLastPage: (page - 1) * commentsPerPage + comments.length === total
      })
    } catch (e) {
      req.flash('error', '无法找到该文章')
      res.redirect('/')
    }
  }

  async function edit (req, res) {
    try {
      let post = await Post.findById(req.params.id)
      res.render('compose', {
        title: '编辑',
        post
      })
    } catch (e) {
      req.flash('error', '无法加载需要编辑的文章')
      return res.redirect('back')
    }
  }

  async function doEdit (req, res) {
    try {
      let tags = req.body.tags.trim()
      if (tags) {
        tags = tags.split(',').map(function (tag) { return tag.trim() })
      } else {
        tags = []
      }
      let data = {
        title: req.body.title,
        content: req.body.content,
        tags,
        titleSearch: jieba.cut(req.body.title),
        $push: {
          utimes: {
            $each: [ Date.now() ],
            $position: 0
          }
        }
      }
      await Post.updateOne({ _id: req.params.id }, data)
      req.flash('success', '修改成功！')
      res.redirect('/p/' + req.params.id)
    } catch (e) {
      req.flash('error', '无法修改文章')
      return res.redirect('back')
    }
  }

  async function remove (req, res) {
    try {
      await Post.deleteOne({ _id: req.params.id })
      await Comment.deleteMany({ post: req.params.id })
      req.flash('success', '删除成功！')
      res.redirect('/')
    } catch (e) {
      req.flash('error', '无法删除文章！')
      res.redirect('back')
    }
  }

  return [
    [ '/compose', 'get', [ checkLogin, compose ] ],
    [ '/compose', 'post', [ checkLogin, doCompose ] ],
    [ '/p/:id', 'get', [ post ] ],
    [ '/edit/:id', 'get', [ checkLogin, edit ] ],
    [ '/edit/:id', 'post', [ checkLogin, doEdit ] ],
    [ '/remove/:id', 'get', [ checkLogin, remove ] ]
  ]
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/post', 'models/comment', 'routes/common', 'lib/marked', 'settings', 'nodejieba' ]
