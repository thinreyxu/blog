var Post = require('../models/post');

module.exports = {
  '/': {
    'get': index
  },
  '/archive': {
    'get': archive
  },
  '/tags': {
    'get': tags
  },
  '/tags/:tag': {
    'get': tag
  },
  '/search': {
    'get': search
  },
  '/links': {
    'get': links
  }
};

function index (req, res) {
  // 判断是否是第一页，并把请求的页数转换成 number 类型
  var page = req.query.p ? parseInt(req.query.p) : 1;
  // 查询并返回第 page 页的 10 篇文章
  Post.getByPage(null, page, function (err, posts, total) {
    if (err) {
      posts = [];
    }
    res.render('index', {
      title: '}{',
      user: req.session.user,
      posts: posts,
      page: page,
      isFirstPage: page === 1,
      isLastPage: (page - 1) * 5 + posts.length === total,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
}

function archive (req, res) {
  Post.getArchive(function (err, posts) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('archive', {
      title: '存档',
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  })
}

function tags (req, res) {
  Post.getTags(function (err, posts) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }

    res.render('tags', {
      title: '标签',
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
}

function tag (req, res) {
  Post.getTag(req.params.tag, function (err, posts) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }

    res.render('tag', {
      title: '标签：' + req.params.tag,
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
}

function search (req, res) {
  Post.search(req.query.keyword, function (err, posts) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('search', {
      title: "搜索：" + req.query.keyword,
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  })
}

function links (req, res) {
  res.render('links', {
    title: '友情链接',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
}