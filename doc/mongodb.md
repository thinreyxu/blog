在Node.js中使用MongoDB
======================

NoSQL = No SQL = Not Only SQL
非关系型、分布式、不提供ACID（事务四特性：Atomicity 原子性、Consistency 一致性、Isolation 隔离性、Durability 持久性）

MongoDB是一个对象数据库，没有表、行的概念，没有固定的模式和结构，数据以文档的形式存储。文档即关联数组式对象。数据格式为BSON（Binary JavaScript Object Notation）。

数据库存储目录： dbpath = "/var/lib/mongodb/"  
数据库配置文件： dbconfig = "/etc/mongo.conf"


使用MongoDB
------------

1. 安装mongodb模块  
在`package.json`中，`dependencies:{}`一项中加入`"mongodb": "*"`，并使用`$ npm install`安装mongodb模块；

2. 创建__服务器实例__和__数据库实例__  
MongoDB 无需实现在数据库中建立数据库与集合，在程序中直接使用即可？（具体操作见下文）

3. 使用数据库  
（具体操作见下文）


MongoDB操作
------------
**0. 创建数据库对象 **
```javascript
var Db = require('mongodb').Db
  , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server
  // 连接localhost:27017的mongodb服务器
  , server = new Server('localhost', Connection.DEFAULT_PORT, {})
  // 链接名为 mydb 的数据库
  , mongodb = new Db('mydb', server, {w: 1});
```

**1. 打开关闭数据库** `> use mydb`
```javascript
mongodb.open(function (err, db) {
  // 失败得到错误 err，成功得到数据库对象 db，db 对象 与 mongodb 对象实际上是相同的
});
mongodb.close();
```

**2. 读取集合**（类似于读取数据库表）
```javascript
db.collection('users', function (err, collection) {
  // 失败得到错误 err，成功的到集合对象 collection
  if (err) {
    // 如果在数据库打开后，发生错误，不要忘记手动的关闭数据库
    mongodb.close();
  }
});
```

**3. 添加**（往集合中添加一个文档，类似于往表中添加一条记录）
```javascript
collection.insert(
  // 插入的数据
  {
    name: 'thinreyxu',
    email: 'thinery.xu@gmail.com'
  },
  // 选项
  { safe: true },
  // 回调函数
  function (err, user) {
    // 插入失败得到 err，成功得到对象 user
    mongodb.close();
  }
)
```

**4. 查找**（在集合中查找文档，类似与在表中查找记录）`> db.users.find()`
```javascript
collection
  // 查找所有 name 为 'thineryxu' 的文档
  // 并且过滤文档的内容，只保留 name 和 email 键
  .find({ name: 'thineryxu' }, {
    name: 1,
    email: 1
  })
  // 时间倒序
  .sort({ time: -1 })
  // 输出为数组
  .toArray(function (err, user) {
    // 失败得到错误 err，成功得到数组形式的数据
    mongodb.close();
  });

// 查找一份文档
collection.findOne(
  { name: 'thinreyxu' },
  function (err, user) {
    // 失败得到错误 err，成功得到查找到的用户对象 user
    mongodb.close();
  }
);

// 查找文档，跳过前 10 * (page - 1) 份，返回 10 份
collection.find({}, {
  skip: 10 * (page - 1),
  limit: 10
});

// 找出给定键（tag）的所有不同的值
collection.distinct('tag', function (err, docs) {
  if (err) {
    mongodb.close();
  }
});
```

**5. 更新**（修改集合中的文档，类似于修改表中的记录）
```javascript
collection.update(
  // 更新 name 为 'thinreyxu' 的文档
  { name: 'thinreyxu' },
  // 将改文档的 email 属性更新为 'thinrey.xu@outlook.com'
  { 
    $set: { email: 'thinrey.xu@outlook.com' },
    $push: { sites: 'http://thinreyxu.github.io/' }
  },
  function (err, result) {
    // TODO: result 是什么
    if (err) {
      mongodb.close();
    }
  }
);
```

**6. 删除**（删除集合中的文档，类似于删除表中的记录）
```javascript
collection.remove(
  // 删除 name 为 'thinreyxu' 的文档
  { name: "thinreyxu" },
  function (err, result) {
    // TODO: result 是什么
    if (err) {
      mongodb.close();
    }
  }
);
```