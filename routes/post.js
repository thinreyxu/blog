const { checkLogin } = require('./common')
const Post = require('../models/post')
const Comment = require('../models/comment')

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

    let post = new Post({
      name: req.session.user.name,
      avatar: req.session.user.avatar,
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
    let actions = [
      Post.getById({ id }),
      Comment.getByPost({ post: id }),
      Post.incPageView({ id })
    ]
    let [ post, comments ] = await Promise.all(actions)
    let from = post.reprint ? post.reprint.from : undefined
    if (from) {
      try {
        post.reprint.from = await Post.getById({ id: from.id })
      } catch (e) {}
    }
    res.render('post', {
      title: post.title,
      post,
      comments,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  } catch (e) {
    req.flash('error', '无法找到该文章')
    res.redirect('/')
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

async function remove (req, res) {
  try {
    await Post.remove({ id: req.params.id })
    await Comment.removeByPost({ post: req.params.id })
    req.flash('success', '删除成功！')
    res.redirect('/')
  } catch (e) {
    req.flash('error', '无法删除文章！')
    res.redirect('back')
  }
}

async function reprint (req, res) {
  try {
    let user = req.session.user
    let from = { id: req.params.id }
    let to = { name: user.name, avatar: user.avatar }
    let post = await Post.reprint(from, to)
    req.flash('success', '转载成功！')
    req.redirect(`/p/${post._id}`)
  } catch (e) {
    req.flash('error', '无法转载文章！')
    res.redirect('back')
  }
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
