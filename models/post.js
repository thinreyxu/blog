const db = require('./db')
    , marked = require('../lib/marked')
    , { JSDOM } = require('jsdom')
    ;

let ObjectID = db.ObjectID;

let wordsends = /[\.\:,\.;~\!\[\]\{\}\(\)\?\"\'：”、，。；！？……\s]/

function Post (name, avatar, title, tags, post) {
  this.name = name;
  this.avatar = avatar;
  this.title = title;
  this.tags = tags;
  this.post = post;
}

module.exports = Post;

function makeSummary (content) {
  let min = 300
    , diff = 20
    ;
  let dom = new JSDOM(marked(content))
    , summary = dom.window.document.body.textContent
    ;
    console.log(dom);
  if (summary.length > min) {
    let stop = summary.substring(min - diff, min + diff).search(wordsends);
    summary = stop !== -1 ? summary.substring(0, min - diff + stop) : summary.substring(0, min);
    summary = summary.trim() + ' …';
  }
  return summary;
}

// 存储一篇文章及其相关信息
Post.prototype.save = function (callback) {
  let date = new Date();
  // 存储各种时间格式，方便以后扩展
  let time = {
    date: date,
    year: date.getFullYear(),
    month: date.getFullYear() + '/' + (date.getMonth() + 1),
    day: date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate(),
    minute: date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
  };
  // 要存入数据库的文档
  let post = {
    name: this.name,
    avatar: this.avatar,
    time: time,
    title: this.title,
    tags: this.tags,
    post: this.post,
    summary: makeSummary(this.post),
    comments: [],
    reprint_info: {},
    pv: 0 // 浏览量
  };
  db.collection('posts', function (err, collection) {
    if (err) {
      db.close();
      return callback(err);
    }
    collection.insert(
      post,
      { safe: true },
      function (err, {ops: [post]}) {
        db.close();
        callback(err, post);
      }
    );
  });
};

Post.getByPage = function (name, page, itemsPerPage, callback) {
  if (typeof itemsPerPage === 'function') {
    callback = itemsPerPage;
    itemsPerPage = 8;
  }
  db.collection('posts', function (err, collection) {
    if (err) {
      db.close();
      return callback(err);
    }

    let query = {};
    if (name) {
      query.name = name;
    }
    // 使用 count 返回特定查询的文档数 total
    collection.count(query, function (err, total) {
      // 根据 query 对象查询，并跳过前 (page - 1) * itemsPerPage 个结果，
      // 返回之后的 itemsPerPage 个结果
      collection
        .find(query, {
          skip: (page - 1) * itemsPerPage,
          limit: itemsPerPage
        })
        .sort({
          time: -1
        })
        .toArray(function (err, docs) {
          db.close();
          if (err) {
            return callback(err);
          }
          let count = docs.length;
          if (count) {
            docs.forEach(function (doc) {
              marked(doc.post, function (err, content) {
                count--;
                if (err) {
                  return callback(err);
                }
                doc.post = content;
                if (count === 0) {
                  callback(null, docs, total);
                }
              });
            });
          }
          else {
            callback(null, docs, total);
          }
        });
    });
  });
};

Post.getById = function (id, callback) {
  db.collection('posts', function (err, collection) {
    if (err) {
      db.close();
      return callback(err);
    }
    let _id = new ObjectID(id);
    collection.findOne({
      '_id': _id
    }, function (err, doc) {
      if (err) {
        db.close();
        return callback(err);
      }

      // 更新浏览量
      collection.update({
        '_id': _id
      }, {
        $inc: { 'pv': 1 }
      }, function (err, result) {
        db.close();
        // 处理 markdown 内容 及 评论
        if (doc) {
          marked(doc.post, function (err, content) {
            if (err) {
              return callback(err);
            }
            doc.post = content;

            if (doc.comments && doc.comments.length) {
              let count = doc.comments.length;
              doc.comments.forEach(function (comment) {
                marked(comment.content, function (err, content) {
                  count--;
                  if (err) {
                    return callback(err);
                  }
                  comment.content = content;
                  if (count === 0) {
                    callback(null, doc); // 返回查询的一篇文章
                  }
                });
              });
            }
            else {
              callback(null, doc); // 返回查询的一篇文章
            }
          });
        }
        else {
          callback(null, doc);
        }
      });
    });
  });
}

Post.edit = function (id, callback) {
  // db和db是一样的对象
  db.collection('posts', function (err, collection) {
    if (err) {
      db.close();
      return callback(err);
    }
    collection.findOne(
      {
        '_id': new ObjectID(id)
      },
      function (err, post) {
        db.close();
        callback(err, post);
      }
    )
  });
};

Post.update = function (id, title, tags, post, callback) {
  db.collection('posts', function (err, collection) {
    if (err) {
      db.close();
      return callback(err);
    }

    collection.update(
      {
        '_id': new ObjectID(id)
      },
      {
        '$set': {
          'title': title,
          'tags': tags,
          'post': post,
          'summary': makeSummary(post)
        }
      },
      function (err, result) {
        db.close();
        callback(err);
      }
    );
  });
};

Post.remove = function (id, callback) {
  db.collection('posts', function (err, collection) {
    if (err) {
      db.close();
      return callback(err);
    }

    let _id = new ObjectID(id);

    collection.findOne(
      { '_id': _id },
      function (err, doc) {
        if (err) {
          db.close();
          return callback(err);
        }

        // 删除转载文章
        if(doc.reprint_info && doc.reprint_info.reprint_from) {
          // 更新原文章所在的文档的 reprint_to
          collection.update(
            { '_id': new ObjectID(doc.reprint_info.reprint_from.id) },
            {
              $pull: {
                'reprint_info.reprint_to': {
                  'id': id
                }
              }
            },
            function (err, result) {
              if (err) {
                db.close();
                return callback(err);
              }

              // 删除转载来的文章所在的文档
              collection.remove(
                { '_id': _id },
                { w: 1 }, // TODO:这个又是做什么用的呢？
                function (err, result) {
                  db.close();
                  callback(err);
                }
              );
            }
          );
        }
        // 直接删除非转载文章
        else {
          collection.remove(
            { '_id': _id },
            { w: 1 }, // TODO:这个又是做什么用的呢？
            function (err, result) {
              db.close();
              callback(err);
            }
          );
        }
      }
    );
  });
};

// 返回所有文章的存档信息
Post.getArchive = function (callback) {
  db.collection('posts', function (err, collection) {
    if (err) {
      db.close();
      return callback(err);
    }
    // 返回只包含 name、time、title 属性的文档组成的存档数组
    collection
      .find({}, {
        'name': 1,
        'time': 1,
        'title': 1
      })
      .sort({
        time: -1
      })
      .toArray(function (err, docs) {
        db.close();
        callback(err, docs);
      });
  });
};

// 获取标签
Post.getTags = function (callback) {
  db.collection('posts', function (err, collection) {
    if (err) {
      db.close();
      return callback(err);
    }
    // distinct 用来找出给定键的所有不同值
    collection.distinct('tags', function (err, docs) {
      db.close();
      callback(err, docs);
    });
  });
};

// 获取含有指定标签的所有文章
Post.getByTag = function (tag, callback) {
  db.collection('posts', function (err, collection) {
    if (err) {
      db.close();
      return callback(err);
    }
    // 通过 tags.tag 查询并返回只含有 name、time、title 键的文档组成的数组
    collection
      .find({ tags: tag }, {
        'name': 1,
        'time': 1,
        'title': 1
      })
      .sort({ time: -1 })
      .toArray(function (err, docs) {
        db.close();
        callback(err, docs);
      })
  });
};

// 搜索
Post.search = function (keyword, callback) {
  db.collection('posts', function (err, collection) {
    // 通过正则表达式查找包含 keyword 的 文档
    let pattern = new RegExp('^.*(' + keyword.trim().split('\s+').join('|') + ').*$', 'i');
    collection
      .find({
          'title': pattern/*,
          'tags': pattern*/  // TODO:如何查找 title 或 tags 中包含关键字呢？
        }, {
          'name': 1,
          'time': 1,
          'title': 1
        })
      .sort({ time: -1 })
      .toArray(function (err, docs) {
        db.close();
        callback(err, docs);
      });
  })
}

// 转载
Post.reprint = function (reprint_from, reprint_to, callback) {
  db.collection('posts', function (err, collection) {
    if (err) {
      db.close();
      return callback(err);
    }

    let id = reprint_from.id
      , _id = new ObjectID(id);
    // 找到被转载的原文档
    collection.findOne(
      { '_id': _id },
      function (err, doc) {
        if (err) {
          db.close();
          return callback(err);
        }

        reprint_from.name = doc.name;

        let date = new Date();
        let time = {
          date: date,
          year: date.getFullYear(),
          month: date.getFullYear() + '/' + (date.getMonth() + 1),
          day: date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate(),
          minute: date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
        };

        delete doc._id;

        doc.name = reprint_to.name;
        doc.avatar = reprint_to.avatar;
        doc.time = time;
        doc.title = (doc.title.search(/[转载]/) > -1) ? doc.title : '[转载]' + doc.title;
        doc.comments = [];
        doc.reprint_info = { reprint_from: reprint_from };
        doc.pv = 0;
        // 这里 tags 和 post 不用改变


        // 将转载生成的副本修改后存入数据库，并返回存储后的文档
        collection.insert(
          doc,
          { safe: true },  // TODO:这个起到了什么作用？
          function (err, post) {
            if (err) {
              db.close();
              return callback(err);
            }
            // 更新被转载的原文档的 reprint_info 中的 reprint_to
            collection.update(
              { '_id': _id  },
              {
                $push: {
                  'reprint_info.reprint_to': {
                    'id': post[0]._id.toString(),
                    'name': reprint_to.name
                  }
                }
              },
              function (err, result) {
                db.close();
                callback(err, post[0]); // post 是一个数组
              }
            )
          }
        );
      }
    )
  });
};
