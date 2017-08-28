// blog app
module.exports = (settings, flash, bodyParser, methodOverride, cookieParser, session, connectMongo, router) => {
  return function () {
    const app = this
    const { dbName, dbHost, dbPort, dbUser, dbPwd, dbAuth } = settings
    const CONNECT_STRING = `mongodb://${dbUser}:${dbPwd}@${dbHost}:${dbPort}/${dbName}?authSource=${dbAuth}`
    const MongoStore = connectMongo(session)

    app.set('views', `${__dirname}/views`)
    app.set('view engine', 'pug')

    app.use(flash())
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
    // app.use('/api', router)
    app.use(router)

    return app
  }
}

module.exports['@singleton'] = true
module.exports['@require'] = [ 'settings', 'connect-flash', 'body-parser', 'method-override', 'cookie-parser', 'express-session', 'connect-mongo', 'api/router' ]
