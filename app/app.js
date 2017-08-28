module.exports = (favicon, stylus, express) => {
  return function () {
    const app = this
    app.use(favicon(`${__dirname}/public/favicon.ico`))
    app.use(stylus.middleware(`${__dirname}/public/stylesheets`))
    app.use(express.static(`${__dirname}/public`))
    return app
  }
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'serve-favicon', 'stylus', 'express' ]
