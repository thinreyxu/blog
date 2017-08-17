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

  return [
    [ '/', 'get', [ index ] ]
  ]
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'modelsOld/post' ]
