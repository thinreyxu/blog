var common = require('./common')
  , crypto = require('crypto')
  , User = require('../models/user')
  , Post = require('../models/post')
  , Comment = require('../models/comment');

module.exports = {
  '/login': {
    'get': [ common.checkNotLogin, login ],
    'post': [ common.checkNotLogin, doLogin ]
  },
  '/reg': {
    'get': [ common.checkNotLogin, reg],
    'post': [ common.checkNotLogin, doReg]
  },
  '/logout': {
    'get': [ common.checkLogin, logout]
  },
  '/u/:name': {
    'get': getUserProfile
  },
  '/u/:name/:day/:title': {
    'get': getUserPost,
    'post': doComment
  },
  '/edit/:name/:day/:title': {
    'get': [common.checkLogin, edit],
    'post': [common.checkLogin, doEdit]
  },
  '/remove/:name/:day/:title': {
    'get': [common.checkLogin, remove]
  },
  '/reprint/:name/:day/:title': {
    'get': [common.checkLogin, reprint]
  }
};

function login (req, res) {
  res.render('login', {
    title: '登录',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
}

function doLogin (req, res) {
  // 生成md5密码
  var md5 = crypto.createHash('md5')
    , password = md5.update(req.body.password).digest('hex');
  // 检查用户是否存在
  User.get(req.body.name, function (err, user) {
    // if (!user) {
    //   req.flash('error', '用户不存在！');
    //   return res.redirect('/login'); // 用户不存在则跳转到登录页
    // }
    // // 检测密码是否一致
    // if (user.password != password) {
    //   req.flash('error', '密码错误！');
    //   return res.redirect('/login'); // 密码错误则跳转到登录页
    // }
    if (!user || user.password !== password) {
      req.flash('error', '用户名或密码错误！');
      return res.redirect('/login');
    }
    // 用户名密码都匹配以后，将用户信息存入 session
    req.session.user = user;
    req.flash('success', '登陆成功！');
    res.redirect('/');
  })
}

function reg (req, res) {
  res.render('reg', {
    title: '注册',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
}

function doReg (req, res) {
  var name =req.body.name,
      password = req.body.password,
      repassword = req.body.repassword;

  // 检测用户两次输入的密码是否一致
  if (password !== repassword) {
    req.flash('error', '两次输入的密码不一致！');
    return res.redirect('/reg');
  }
  // 生成密码的 md5 值
  var md5 = crypto.createHash('md5')
    , password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
    name: name,
    password: password,
    email: req.body.email
  });
  // 检查用户名是否已经存在
  User.get(newUser.name, function (err, user) {
    if (user) {
      req.flash('error', '用户已存在！');
      return res.redirect('/reg');  // 用户名存在则返回注册页
    }
    // 如果不存在则新增用户
    newUser.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');
      }
      req.session.user = newUser; // 用户信息存入 session
      req.flash('success', '注册成功！');
      res.redirect('/');  // 注册成功后返回主页
    });
  });
}

function logout (req, res) {
  req.session.user = null;  // 将session中的用户信息删掉，实现用户退出
  req.flash('success', '退出成功!');
  res.redirect('/');
}

function getUserProfile (req, res) {
  User.get(req.params.name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在！');
      return res.redirect('/'); // 用户不存在则跳转到主页
    }

    var page = req.query.page ? parseInt(req.query.p) : 1;
    // 查询并返回该用户的所有文章
    Post.getByPage(user.name, page, function (err, posts, total) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        posts: posts,
        page: page,
        isFirstPage: page === 1,
        isLastPage: (page - 1) * 5 + posts.length === total,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
}

function getUserPost (req, res) {
  Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('article', {
      title: req.params.title,
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
}

function edit (req, res) {
  var currentUser = req.session.user;
  Post.edit(
    currentUser.name,
    req.params.day,
    req.params.title,
    function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('edit', {
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
    currentUser.name,
    req.params.day,
    req.params.title,
    req.body.tags.trim().split(', ').map(function (tag) { return tag.trim() }),
    req.body.post,
    function (err) {
      var url = ['/u', req.params.name, req.params.day, req.params.title].join('/');
      if (err) {
        req.flash('error', err);
        return redirect(url);  // 出错！返回文章页面
      }
      req.flash('success', '修改成功！');
      res.redirect(url);  // 成功！返回文章页面
    }
  );
}

function remove (req, res) {
  var currentUser = req.session.user;
  Post.remove(
    currentUser.name,
    req.params.day,
    req.params.title,
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

function doComment (req, res) {
  var date = new Date()
    , time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        + ' ' + date.getHours() + ':' + date.getMinutes()
    , md5 = crypto.createHash('md5')
    , email_md5 = md5.update(req.body.email.toLowerCase()).digest('hex')
    , avatar = 'http://www.gravatar.com/avatar/' + email_md5 + '?s=48&d=https%3A%2F%2Fidenticons.github.com%2F3632892525abab630a972bc0a368853c.png?s=40';

  var comment = {
    name: req.body.name,
    avatar: avatar,
    email: req.body.email,
    website: req.body.website,
    content: req.body.content,
    time: time
  };

  var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
  newComment.save(function (err) {
    if (err) {
      req.flash('error', err);
      return res.redirect(req.url);
    }
    req.flash('success', '留言成功！');
    res.redirect(req.url);
  });
}

function reprint (req, res) {
  Post.edit(req.params.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect(back);
    }

    var currentUser = req.session.user
      , reprint_from = {
          name: req.params.name,
          day: req.params.day,
          title: req.params.title
        }
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

      var url = '/u/' + post.name + '/' + post.time.day + '/' + post.title;
      // 跳转到转载后的文章页面
      res.redirect(url);
    });
  });
}