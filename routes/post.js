const common = require('./common')
const Post = require('../models/post')

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
}

function compose (req, res) {
  // res.send('post')
  res.render('compose', {
    title: '发表',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  })
}

function doCompose (req, res) {
  let currentUser = req.session.user

  let tags = req.body.tags.trim()
  if (tags) {
    tags = tags.split(',').map(function (tag) { return tag.trim() })
  } else {
    tags = []
  }

  let post = new Post(
    currentUser.name,
    currentUser.avatar,
    req.body.title,
    tags,
    req.body.post
  )

  post.save(function (err, post) {
    if (err) {
      req.flash('error', err)
      return res.redirect('/')
    }
    req.flash('success', '发布成功！')
    console.log(post)
    res.redirect('/p/' + post._id)
  })
}

async function post (req, res, next) {
  let id = req.params.id
  try {
    let post = await Post.getById({ id })
    let from = post.reprint ? post.reprint.from : undefined
    if (from) {
      try {
        post.reprint.from = await Post.getById(from.id)
      } catch (e) {}
    }
    res.render('article', {
      title: post.title,
      post,
      user: req.session.user,
      cate: 'article',
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  } catch (e) {
    req.flash('error')
    // res.redirect('/')
    next()
  }
}

function edit (req, res) {
  let currentUser = req.session.user
  Post.edit(
    req.params.id,
    function (err, post) {
      if (err) {
        req.flash('error', err)
        return res.redirect('back')
      }
      res.render('compose', {
        title: '编辑',
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      })
    }
  )
}

function doEdit (req, res) {
  let currentUser = req.session.user
  let tags = req.body.tags.trim()
  if (tags) {
    tags = tags.split(',').map(function (tag) { return tag.trim() })
  }
  else {
    tags = []
  }
  Post.update(
    req.params.id,
    req.body.title,
    tags,
    req.body.post,
    function (err) {
      if (err) {
        req.flash('error', err)
        return redirect(url)  // 出错！返回文章页面
      }
      req.flash('success', '修改成功！')
      res.redirect('/p/' + req.params.id)  // 成功！返回文章页面
    }
  )
}

function remove (req, res) {
  let currentUser = req.session.user
  Post.remove(
    req.params.id,
    function (err) {
      if (err) {
        req.flash('error', err)
        res.redirect('back')
      }
      req.flash('success', '删除成功！')
      res.redirect('/u/' + currentUser.name)
    }
  )
}

function reprint (req, res) {
  Post.edit(req.params.id, function (err, post) {
    if (err) {
      req.flash('error', err)
      return res.redirect('back')
    }

    let currentUser = req.session.user
      , reprint_from = { id: req.params.id }
      , reprint_to = {
          name: currentUser.name,
          avatar: currentUser.avatar
        }

    Post.reprint(reprint_from, reprint_to, function (err, post) {
      if (err) {
        req.flash('error', err)
        return res.redirect(back)
      }
      req.flash('success', '转载成功！')
      // 跳转到转载后的文章页面
      res.redirect('/p/' + post._id)
    })
  })
}
