var common = require('./common')
  , Post = require('../models/post.js');

module.exports = {
  '/compose': {
    'get': [ common.checkLogin, compose ],
    'post': [ common.checkLogin, doCompose ]
  },
  '/p/:id': {
    'get': post
  },
  '/edit/:id': {
    'get': [common.checkLogin, edit],
    'post': [common.checkLogin, doEdit]
  },
  '/remove/:id': {
    'get': [common.checkLogin, remove]
  },
  '/reprint/:id': {
    'get': [common.checkLogin, reprint]
  }
};

function compose (req, res) {
  // res.send('post');
  res.render('compose', {
    title: '发表',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  })
}

function doCompose (req, res) {
  var currentUser = req.session.user
    , tags = req.body.tags.trim().split(',').map(function (tag) { return tag.trim(); })
    , post = new Post(currentUser.name, currentUser.avatar, req.body.title, tags, req.body.post);

  post.save(function (err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', '发布成功！');
    res.redirect('/p/' + post._id);
  });
}

function post (req, res, next) {
  var id = req.params.id;
  Post.getById(id, function (err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (post) {
      !function (callback) {
        var reprint_from
        if (post.reprint_info && (reprint_from = post.reprint_info.reprint_from)) {
          Post.getById(reprint_from.id, function (err, oriPost) {
            if (oriPost) {
              post.reprint_info.reprint_from = oriPost;
              callback();
            }
          });
        }
        else {
          callback();
        }
      }(function () {
        res.render('article', {
          title: post.title,
          post: post,
          user: req.session.user,
          cate: 'article',
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    }
    else {
      next();
    }
  });
}

function edit (req, res) {
  var currentUser = req.session.user;
  Post.edit(
    req.params.id,
    function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('compose', {
        title: '编辑',
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    }
  );
}

function doEdit (req, res) {
  var currentUser = req.session.user;
  Post.update(
    req.params.id,
    req.body.title,
    req.body.tags.trim().split(',').map(function (tag) { return tag.trim(); }),
    req.body.post,
    function (err) {
      if (err) {
        req.flash('error', err);
        return redirect(url);  // 出错！返回文章页面
      }
      req.flash('success', '修改成功！');
      res.redirect('/p/' + req.params.id);  // 成功！返回文章页面
    }
  );
}

function remove (req, res) {
  var currentUser = req.session.user;
  Post.remove(
    req.params.id,
    function (err) {
      if (err) {
        req.flash('error', err);
        res.redirect('back');
      }
      req.flash('success', '删除成功！');
      res.redirect('/u/' + currentUser.name);
    }
  );
}

function reprint (req, res) {
  Post.edit(req.params.id, function (err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }

    var currentUser = req.session.user
      , reprint_from = { id: req.params.id }
      , reprint_to = {
          name: currentUser.name,
          avatar: currentUser.avatar
        };

    Post.reprint(reprint_from, reprint_to, function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect(back);
      }
      req.flash('success', '转载成功！');
      // 跳转到转载后的文章页面
      res.redirect('/p/' + post._id);
    });
  });
}