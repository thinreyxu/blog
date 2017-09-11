module.exports = () => {
  async function index (req, res, next) {
    res.redirect('/blog')
  }

  return [
    [ '/', 'get', [ index ] ]
  ]
}
module.exports['@singleton'] = true
