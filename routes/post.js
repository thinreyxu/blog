const { checkLogin } = require('./common')
const Post = require('../models/post')

function compose (req, res) {
  // res.send('post')
  res.render('compose', {
    title: '发表',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  })
}

async function doCompose (req, res) {
  try {
    let tags = req.body.tags.trim()
    if (tags) {
      tags = tags.split(',').map(tag => tag.trim())
    } else {
      tags = []
    }

    let currentUser = req.session.user
    let post = new Post({
      name: currentUser.name,
      avatar: currentUser.avatar,
      title: req.body.title,
      content: req.body.content,
      tags
    })

    await post.save()
    req.flash('success', '发布成功！')
    res.redirect(`/p/${post._id.toString()}`)
  } catch (e) {
    req.flash('error', '无法发布博客')
    return res.redirect('back')
  }
}

async function post (req, res, next) {
  let id = req.params.id
  try {
    let post = await Post.getById({ id })
    let from = post.reprint ? post.reprint.from : undefined
    if (from) {
      try {
        post.reprint.from = await Post.getById({ id: from.id })
      } catch (e) {}
    }
    res.render('post', {
      title: post.title,
      post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  } catch (e) {
    console.log(e)
    req.flash('error', '无法找到该文章')
    // res.redirect('/')
    next()
  }
}

async function edit (req, res) {
  try {
    let post = await Post.edit({ id: req.params.id })
    res.render('compose', {
      title: '编辑',
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  } catch (e) {
    req.flash('error', '无法加载需要编辑的文章')
    return res.redirect('back')
  }
}

async function doEdit (req, res) {
  let tags = req.body.tags.trim()
  if (tags) {
    tags = tags.split(',').map(function (tag) { return tag.trim() })
  } else {
    tags = []
  }
  try {
    await Post.update({
      id: req.params.id,
      title: req.body.title,
      content: req.body.content,
      tags
    })
    req.flash('success', '修改成功！')
    res.redirect('/p/' + req.params.id)
  } catch (e) {
    req.flash('error', '无法修改文章')
    return res.redirect('back')
  }
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
        return res.redirect('back')
      }
      req.flash('success', '转载成功！')
      // 跳转到转载后的文章页面
      res.redirect('/p/' + post._id)
    })
  })
}

module.exports = [
  [ '/compose', 'get', [ checkLogin, compose ] ],
  [ '/compose', 'post', [ checkLogin, doCompose ] ],
  [ '/p/:id', 'get', [ post ] ],
  [ '/edit/:id', 'get', [ checkLogin, edit ] ],
  [ '/edit/:id', 'post', [ checkLogin, doEdit ] ],
  [ '/remove/:id', 'get', [ checkLogin, remove ] ],
  [ '/reprint/:id', 'get', [ checkLogin, reprint ] ]
]
