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

  return [
    [ '/archive', 'get', [ archive ] ]
  ]
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/post' ]
