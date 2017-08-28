module.exports = (express, logger, rfs, settings, app, api) => {
  const server = express()

  server.set('port', process.env.PORT || settings.servePort)

  const logfileOptions = {
    interval: '1d',
    path: './log'
  }
  const accessLog = rfs('access.log', logfileOptions)
  const errorLog = rfs('error.log', logfileOptions)
  if (process.env.NODE_ENV !== 'production') {
    server.use(logger('dev')) // 终端输出访问信息
  }
  server.use(logger('combined', { stream: accessLog }))  // 将访问信息记录入文件

  app.apply(server)
  api.apply(server)

  // 处理 404 页面
  server.use((req, res, next) => {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  // 处理错误
  server.use((err, req, res, next) => {
    let meta = `[${new Date().toString().padEnd(80, '=')}] ${req.url}`
    errorLog.write(`${meta}\n${err.stack}\n`)
    res.sendStatus(404)
    // res.render('404', {
    //   title: '404',
    //   user: req.session.user,
    //   success: req.flash('success').toString(),
    //   error: req.flash('error').toString()
    // })
  })

  return server
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'express', 'morgan', 'rotating-file-stream', 'settings', 'app/app', 'api/api' ]

if (require.main === module) {
  (async () => {
    try {
      const ioc = require('./ioc')
      const server = await ioc.create('server')
      const port = server.get('port')
      server.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
      })
    } catch (e) {
      console.log(e)
    }
  })()
}
