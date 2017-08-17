module.exports = (Post) => {
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

  return [
    [ '/archive', 'get', [ archive ] ]
  ]
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'modelsOld/post' ]
