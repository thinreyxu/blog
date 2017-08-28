module.exports = (Post, settings) => {
  async function index (req, res, next) {
    try {
      // 判断是否是第一页，并把请求的页数转换成 number 类型
      let page = Math.max(req.query.p ? Number.parseInt(req.query.p) : 1)
      let { postsPerPage } = settings
      // 查询并返回第 page 页的 n 篇文章
      let total = await Post.find().count()
      let posts = await Post.find().sort({ ctime: -1 }).page(page, postsPerPage)
      res.render('index', {
        title: '}{',
        posts,
        page,
        isFirstPage: page === 1,
        isLastPage: (page - 1) * postsPerPage + posts.length === total
      })
    } catch (e) {
      next(e)
    }
  }

  return [
    [ '/', 'get', [ index ] ]
  ]
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/post', 'settings' ]
