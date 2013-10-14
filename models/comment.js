var db = require('./db.js');

var ObjectID = db.ObjectID;

function Comment (id, comment) {
  this.id = id;
  this.comment = comment;
}

module.exports = Comment;

// 存储一条留言信息
Comment.prototype.save = function (callback) {
  var id = this.id
    , comment = this.comment;

  db.collection('posts', function (err, collection) {
    if (err) {
      db.close();
      return callback(err);
    }
    // 通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments 数组
    collection.update(
      { '_id': new ObjectID(id) },
      {
        $push: { "comments": comment }
      },
      function (err, result) {
        db.close();
        callback(null);
      }
    );
  });
}