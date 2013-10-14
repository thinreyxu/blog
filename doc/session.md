在 Express 中使用 session
=========================

**会话**是一种持久的网络协议，用于完成服务器和客户端之间的一些交互行为。会话比连接的粒度大，一次会话可以包含多个连接。许多网络层协议都是由会话支持的，如 FTP、Telnet。但HTTP是无状态协议，自身不支持会话。

express 默认提供了会话中间件，该中间件把用户信息存储在内存中。除此之外，还可以使用 cookieSession，mongodb 和 redis 来存储 session 信息。


1. 使用默认的 session
---------------------
1. 使用默认 session
```javascript
app.use(express.cookieParser('keysecretKey'));
app.use(express.session());
```

2. 通过`req.session`访问 session 数据



2. 使用 cookieSession 实现 session
----------------------------------

1. 使用 cookieSession 模块
```javascript
app.use(cookieParser('secretKey'));
app.use(express.cookieSession());
```

2. 通过`req.session`访问 session 数据



3. 使用 mongodb 实现 session
----------------------------

1. 安装 connect-mongo 模块  
在`package.json`中，`dependencies:{}`一项中加入`"connect-mongo":"*"`，并使用`$ npm install`安装模块；

2. 使用 connect-mongo 模块  
```javascript
// 将 express 作为参数使得 MongoStore 可以继承 express.session.Store
var MongoStore = require('connect-mongo')(express);
app.use(express.cookieParser());  // 用来解析 cookie
app.use(express.session({
  secret: 'secretKey',  // 用于防止篡改 cookie
  key: 'SSID',  // 写入 cookie 的 session id 名
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },  // cookie 生存期为 30 天
  store: new MongoStore({
    db: 'mydb'  // 将 session 信息存储在 mongodb 中的 mydb 数据库中
  })
}))
```

3. 通过`req.session`访问 session 数据



4. 使用 redis 实现 session
--------------------------

1. 安装 connect-redis 模块  
在`package.json`中，`dependencies:{}`一项中加入`"connect-redis":"*"`，并使用`$ npm install`安装模块；

2. 使用 connect-redis 模块
```javascript
var RedisStore = require('connect-redis')(express);
app.use(express.cookieParser('secretKey'));
app.use(express.session({ store: new RedisStore }));
```

3. 通过`req.session`访问 session 数据


- - -

### 参考
1. [Express MongoDB 搭建多人博客][1]
2. [Express Example - cookie-sessions][2]
3. [Express Examples - session][3]
4. [Express Examples - session-redis][4]


[1]: http://github.com/nswbmw/N-blog/wiki/%E7%AC%AC1%E7%AB%A0--Express-MongoDB-%E6%90%AD%E5%BB%BA%E5%A4%9A%E4%BA%BA%E5%8D%9A%E5%AE%A2#%E4%BC%9A%E8%AF%9D%E6%94%AF%E6%8C%81 "Express MongoDB 搭建多人博客"
[2]: https://github.com/visionmedia/express/blob/master/examples/cookie-sessions/index.js "Express Examples - cookie-sessions"
[3]: https://github.com/visionmedia/express/blob/master/examples/session/index.js "Express Examples - session"
[4]: https://github.com/visionmedia/express/blob/master/examples/session/redis.js "Express Examples - session-redis"