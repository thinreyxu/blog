module.exports = (Post, settings) => {
  const { resultsPerPage } = settings
  async function search (req, res) {
    try {
      let posts, total
      let keywords = (req.query.q || '').trim()
      let page = Math.max(req.query.p ? Number.parseInt(req.query.p) : 1)
      if (keywords) {
        let query = Post.search(keywords)
        total = await query.count()
        posts = await query.page(page, resultsPerPage)
      } else {
        total = 0
        posts = []
      }
      res.render('search', {
        title: `${keywords}`,
        posts,
        page,
        isFirstPage: page === 1,
        isLastPage: (page - 1) * resultsPerPage + posts.length === total
      })
    } catch (e) {
      console.log(e)
      req.flash('error', '搜索故障！')
      req.redirect('/search')
    }
  }

  return [
    [ '/search', 'get', [ search ] ],
    [ '/search?q=:keyword', 'get', [ search ] ]
  ]
}
module.exports['@singletong'] = true
module.exports['@require'] = [ 'models/post', 'settings' ]
