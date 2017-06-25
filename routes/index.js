var Post = require('../models/post')

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
  '/tag/:tag': {
    'get': tag
  },
  '/search': {
    'get': search
  },
  '/links': {
    'get': links
  }
}

async function index (req, res) {
  // 判断是否是第一页，并把请求的页数转换成 number 类型
  let page = req.query.p ? parseInt(req.query.p) : 1
  let itemsPerPage = 8
  // 查询并返回第 page 页的 n 篇文章
  let { posts, total } = await Post.getByPage({ page, itemsPerPage })
  res.render('index', {
    title: '}{',
    user: req.session.user,
    posts: posts,
    page: page,
    cate: 'index',
    isFirstPage: page === 1,
    isLastPage: (page - 1) * itemsPerPage + posts.length === total,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  })
}

async function archive (req, res) {
  try {
    let posts = await Post.getArchive()
    res.render('archive', {
      title: '存档',
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  } catch (e) {
    req.flash('error', e)
    res.redirect('/')
  }
}

function tags (req, res) {
  Post.getTags(function (err, posts) {
    if (err) {
      req.flash('error', err)
      return res.redirect('/')
    }

    res.render('tags', {
      title: '标签',
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  })
}

function tag (req, res) {
  Post.getByTag(req.params.tag, function (err, posts) {
    if (err) {
      req.flash('error', err)
      return res.redirect('/')
    }

    res.render('tag', {
      title: '标签：' + req.params.tag,
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  })
}

function search (req, res) {
  Post.search(req.query.keyword, function (err, posts) {
    if (err) {
      req.flash('error', err)
      return res.redirect('/')
    }
    res.render('search', {
      title: '搜索：' + req.query.keyword,
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  })
}

function links (req, res) {
  res.render('links', {
    title: '友情链接',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  })
}
