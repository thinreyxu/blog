
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/routes')
  , http = require('http')
  , path = require('path')
  , MongoStore = require('connect-mongo')(express)
  , settings = require('./settings')
  , flash = require('connect-flash')
  , fs = require('fs');

var accessLog = fs.createWriteStream('./log/access.log', { flags: 'a' })
  , errorLog = fs.createWriteStream('./log/error.log', { flags: 'a' });

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());
// app.use(express.favicon());
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));  // 在终端现实日志信息
app.use(express.logger({ stream: accessLog }));  // 将访问信息记录入文件
app.use(express.bodyParser({
  keepExtensions: true,  // 保留文件的扩展名
  uploadDir: './public/upload'  // 文件上传的目录
}));  // 用来解析请求体
app.use(express.methodOverride());  // 伪装PUT、DELETE
app.use(express.cookieParser());  // cookie解析中间件
app.use(express.session({
  secret: settings.cookieSecret,  //用来防止篡改 cookie
  key: settings.db,  // cookie的名字
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },  // cookie的生存期30天
  store: new MongoStore({
    db: settings.db
  })
}));
app.use(app.router); // 用于确定 router 中间件的调用顺序
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  // 在 console 中 打印日志
  app.use(express.errorHandler());
}

// production only
if ('production' === app.get('env')) {
  app.use(function (err, req, res, next) {
    var meta = '[' + new Date() + ']' + req.url + '\n';
    errorLog.write(meta + err.stack + '\n');
    next();
  });
}

// 处理 404 页面
app.use(function (req, res) {
  res.render('404', {
    title: "404",
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});