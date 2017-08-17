module.exports = (Post) => {
  async function index (req, res, next) {
    try {
      // 判断是否是第一页，并把请求的页数转换成 number 类型
      let page = req.query.p ? parseInt(req.query.p) : 1
      let itemsPerPage = 8
      // 查询并返回第 page 页的 n 篇文章
      let { posts, total } = await Post.getByPage({ page, itemsPerPage })
      res.render('index', {
        title: '}{',
        posts: posts,
        page: page,
        cate: 'index',
        isFirstPage: page === 1,
        isLastPage: (page - 1) * itemsPerPage + posts.length === total
      })
    } catch (e) {
      next(e)
    }
  }

  async function archive (req, res) {
    try {
      let postsByYear = await Post.getArchive()
      res.render('archive', {
        title: '存档',
        postsByYear
      })
    } catch (e) {
      req.flash('error', e)
      res.redirect('/')
    }
  }

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

  async function search (req, res) {
    let posts
    let keyword = req.query.q
    try {
      if (keyword) posts = await Post.search({ keyword })
      else posts = []
    } catch (e) {
      posts = []
      req.flash('error', e)
    } finally {
      res.render('search', {
        title: `搜索${keyword ? '：' + keyword : ''}`,
        posts
      })
    }
  }

  function links (req, res) {
    res.render('links', {
      title: '友情链接'
    })
  }

  return [
    [ '/', 'get', [ index ] ],
    [ '/archive', 'get', [ archive ] ],
    [ '/tags', 'get', [ tags ] ],
    [ '/tag/:tag', 'get', [ tag ] ],
    [ '/search', 'get', [ search ] ],
    [ '/search?q=:keyword', 'get', [ search ] ],
    [ '/links', 'get', [ links ] ]
  ]
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'modelsOld/post' ]
