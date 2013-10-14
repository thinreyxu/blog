var common = require('./common')
  , Post = require('../models/post.js');

module.exports = {
  '/post': {
    'get': [ common.checkLogin, post ],
    'post': [ common.checkLogin, doPost ]
  }
};

function post (req, res) {
  // res.send('post');
  res.render('post', {
    title: '发表',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  })
}

function doPost (req, res) {
  var currentUser = req.session.user
    , tags = req.body.tags.trim().split(', ').map(function (tag) { return tag.trim(); })
    , post = new Post(currentUser.name, currentUser.avatar, req.body.title, tags, req.body.post);

  post.save(function (err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', '发布成功！');
    res.redirect('/');
  });
}