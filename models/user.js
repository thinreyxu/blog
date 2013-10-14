var db = require('./db')
  , crypto = require('crypto');

function User (user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
}

module.exports = User;

// 存储用户信息
User.prototype.save = function (callback) {
  var md5 = crypto.createHash('md5')
    , email_md5 = md5.update(this.email.toLowerCase()).digest('hex')
    , avatar = 'http://www.gravatar.com/avatar/' + email_md5 + '?s=48&d=https%3A%2F%2Fidenticons.github.com%2F3632892525abab630a972bc0a368853c.png?s=40';
  // 要存入数据库的用户文档
  var user = {
    name: this.name,
    password: this.password,
    email: this.email,
    avatar: avatar
  };
  // 读取 users 集合
  db.collection('users', function (err, collection) {
    if (err) {
      db.close();
      return callback(err); // 错误，返回 err 信息
    }
    // 将用户数据插入 users 集合
    collection.insert(user, {safe: true}, function (err, user) {
      db.close();  // 关闭数据库
      callback(null); // 成功！ err 为 null
    });
  });
}

// 读取用户信息
User.get = function (name, callback) {
  // 读取 users 集合
  db.collection('users', function (err, collection) {
    if (err) {
      db.close(); // 关闭数据库
      return callback(err); // 错误，返回 err 信息
    }
    // 查找用户名（name 键）值为 name 的一个文档
    collection.findOne({
      name: name
    }, function (err, user) {
      db.close();  // 关闭数据库
      if (user) {
        return callback(null, user); // 成功！返回查询的用户信息
      }
      callback(err); // 失败！返回 err 信息
    })
  });
}