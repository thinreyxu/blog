module.exports = (Post) => {
  async function archive (req, res) {
    try {
      let posts = await Post.find().sort({ ctime: -1 })
      res.render('archive', {
        title: '存档',
        posts
      })
    } catch (e) {
      console.log(e)
      req.flash('error', e)
      res.redirect('/')
    }
  }

  async function archiveByYear (req, res) {
    try {
      let year = req.params.year
      let posts = await Post.find().sort({ ctime: -1 })
      res.render('archive', {
        title: '存档',
        posts
      })
    } catch (e) {
      console.log(e)
      req.flash('error', e)
      res.redirect('/')
    }
  }

  return [
    [ '/archives', 'get', [ archive ] ],
    [ '/archives/:year', 'get', [ archiveByYear ] ]
  ]
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/post' ]
