// blog app
const express = require('express')
    , routes = require('./routes/routes')
    , http = require('http')
    , path = require('path')
    , settings = require('./settings')
    , flash = require('connect-flash')
    , stylus = require('stylus')
    , fs = require('fs')
    , bodyParser = require('body-parser')
    , multer = require('multer')
    , favicon = require('serve-favicon')
    , logger = require('morgan')
    , methodOverride = require('method-override')
    , cookieParser = require('cookie-parser')
    , session = require('express-session')
    , MongoStore = require('connect-mongo')(session)
    , sstatic = require('serve-static')
    , errorHandler = require('errorhandler')
    ;

const accessLog = fs.createWriteStream('./log/access.log', { flags: 'a' })
    , errorLog = fs.createWriteStream('./log/error.log', { flags: 'a' });

const app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(flash());
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));  // 在终端现实日志信息
// app.use(logger('default', { stream: accessLog }));  // 将访问信息记录入文件
app.use(methodOverride());  // 伪装PUT、DELETE
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));  // 用来解析请求体
// app.use(multer({ dest: './public/upload' }));
app.use(cookieParser());  // cookie解析中间件
app.use(session({
  secret: settings.cookieSecret,  //用来防止篡改 cookie
  transformId: settings.app_name,  // cookie的名字
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },  // cookie的生存期30天
  autoRemove: 'native',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    url: `mongodb://${settings.db_host}:${settings.db_port}/${settings.db_name}`
  })
}));
app.use(routes);
app.use(stylus.middleware(__dirname + '/public/stylesheets'));
app.use(sstatic(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  // 在 console 中 打印日志
  app.use(errorHandler());
}

// production only
if ('production' === app.get('env')) {
  app.use((err, req, res, next) => {
    let meta = `[${new Date()}] ${req.url}\n`;
    errorLog.write(meta + err.stack + '\n');
    next();
  });
}

// 处理 404 页面
app.use((req, res) => {
  res.render('404', {
    title: "404",
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

// app.get('/', (req, res, next) => {
//   res.send("sdfdf");
// });
const server = http.createServer(app);
server.listen(app.get('port'), () =>
  console.log('Express server listening on port ' + app.get('port'))
);
