var common = require('./common')
  , crypto = require('crypto')
  , User = require('../models/user')
  , Post = require('../models/post')
  , Comment = require('../models/comment');

module.exports = {
  '/comment/:id': {
    'post': doComment
  }
}

function doComment (req, res) {
  var date = new Date()
    , time = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
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

  var newComment = new Comment(req.params.id, comment);
  newComment.save(function (err) {
    if (err) {
      req.flash('error', err);
      return res.redirect(req.url);
    }
    req.flash('success', '留言成功！');
    res.redirect('p/' + req.params.id);
  });
}