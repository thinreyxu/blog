module.exports = (Post, settings) => {
  const { postsPerPage } = settings
  async function blog (req, res, next) {
    try {
      // 判断是否是第一页，并把请求的页数转换成 number 类型
      let page = Math.max(req.query.p ? Number.parseInt(req.query.p) : 1)
      // 查询并返回第 page 页的 n 篇文章
      let total = await Post.find().count()
      let posts = await Post.find().sort({ ctime: -1 }).page(page, postsPerPage)
      let tags = await Post.distinct('tags')
      let archives = await Post.groupByYear()
      res.render('index', {
        title: '}{',
        posts,
        page,
        tags,
        archives,
        isFirstPage: page === 1,
        isLastPage: (page - 1) * postsPerPage + posts.length === total
      })
    } catch (e) {
      next(e)
    }
  }

  return [
    [ '/blog', 'get', [ blog ] ]
  ]
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/post', 'settings' ]
