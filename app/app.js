// blog app
module.exports = (express, router, settings, flash, stylus, bodyParser, favicon, logger, methodOverride, cookieParser, session, connectMongo, sstatic, rfs) => {
  const { dbName, dbHost, dbPort, dbUser, dbPwd, dbAuth } = settings
  const CONNECT_STRING = `mongodb://${dbUser}:${dbPwd}@${dbHost}:${dbPort}/${dbName}?authSource=${dbAuth}`
  const MongoStore = connectMongo(session)

  const logfileOptions = {
    interval: '1d',
    path: './log'
  }
  const accessLog = rfs('access.log', logfileOptions)
  const errorLog = rfs('error.log', logfileOptions)

  const app = express()

  app.set('port', process.env.PORT || settings.servePort)
  app.set('views', `${__dirname}/views`)
  app.set('view engine', 'pug')

  app.use(flash())
  app.use(favicon(`${__dirname}/public/images/favicon.ico`))
  app.use(logger('dev')) // 终端输出访问信息
  app.use(logger('combined', { stream: accessLog }))  // 将访问信息记录入文件
  app.use(methodOverride())  // 伪装PUT、DELETE
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))  // 用来解析请求体
  app.use(cookieParser())  // cookie解析中间件
  app.use(session({
    secret: settings.encSalt,  // 用来防止篡改 cookie
    transformId: settings.appName,  // cookie的名字
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },  // cookie的生存期30天
    autoRemove: 'native',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ url: CONNECT_STRING })
  }))
  app.use((req, res, next) => {
    res.locals.user = req.session.user
    res.locals.success = req.flash('success').toString()
    res.locals.error = req.flash('error').toString()
    next()
  })
  app.use(router)
  app.use(stylus.middleware(`${__dirname}/public/stylesheets`))
  app.use(sstatic(`${__dirname}/public`))

  // 处理 404 页面
  app.use((req, res, next) => {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  // 处理错误
  app.use((err, req, res, next) => {
    let meta = `[${new Date().toString().padEnd(80, '=')}] ${req.url}`
    errorLog.write(`${meta}\n${err.stack}\n`)
    console.error(err)

    res.render('404', {
      title: '404',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  })

  return app
}

module.exports['@singleton'] = true
module.exports['@require'] = ['express', 'routes/router', 'settings', 'connect-flash', 'stylus', 'body-parser', 'serve-favicon', 'morgan', 'method-override', 'cookie-parser', 'express-session', 'connect-mongo', 'serve-static', 'rotating-file-stream']
