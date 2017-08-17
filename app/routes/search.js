module.exports = (Post) => {
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

  return [
    [ '/search', 'get', [ search ] ],
    [ '/search?q=:keyword', 'get', [ search ] ]
  ]
}
module.exports['@singletong'] = true
module.exports['@require'] = [ 'modelsOld/post' ]
