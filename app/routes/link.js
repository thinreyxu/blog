module.exports = () => {
  function links (req, res) {
    res.render('links', {
      title: '友情链接'
    })
  }

  return [
    [ '/links', 'get', [ links ] ]
  ]
}
module.exports['@singleton'] = true
