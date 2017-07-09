var Post = require('../models/post')

async function index (req, res, next) {
  try {
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
  } catch (e) {
    next(e)
  }
}

async function archive (req, res) {
  try {
    let postsByYear = await Post.getArchive()
    res.render('archive', {
      title: '存档',
      postsByYear,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  } catch (e) {
    req.flash('error', e)
    res.redirect('/')
  }
}

async function tags (req, res, next) {
  try {
    let tags = await Post.getTags()
    res.render('tags', {
      title: '标签',
      tags,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  } catch (e) {
    req.flash('error', '无法读取标签')
    next()
  }
}

async function tag (req, res, next) {
  try {
    let tag = req.params.tag
    let posts = await Post.getByTag({ tag })
    res.render('tag', {
      title: `标签：${tag}`,
      posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  } catch (e) {
    req.flash('error', '无法获取文章')
    next()
  }
}

async function search (req, res) {
  let posts
  let keyword = req.query.q
  try {
    if (keyword) posts = await Post.search({ keyword })
    else posts = []
  } catch (e) {
    posts = []
    req.flash('error', e)
  } finally {
    res.render('search', {
      title: `搜索${keyword ? '：' + keyword : ''}`,
      posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  }
}

function links (req, res) {
  res.render('links', {
    title: '友情链接',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  })
}

module.exports = [
  [ '/', 'get', [ index ] ],
  [ '/archive', 'get', [ archive ] ],
  [ '/tags', 'get', [ tags ] ],
  [ '/tag/:tag', 'get', [ tag ] ],
  [ '/search', 'get', [ search ] ],
  [ '/search?q=:keyword', 'get', [ search ] ],
  [ '/links', 'get', [ links ] ]
]
