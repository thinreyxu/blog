module.exports = (User, Post, common, crypto, avatar, settings) => {
  const { checkNotLogin, checkLogin } = common
  const { md5WithSalt: encrypt } = crypto
  const { makeAvatar } = avatar
  const { postsPerPage } = settings

  function login (req, res) {
    res.render('login', { title: '登录' })
  }

  async function doLogin (req, res) {
    try {
      // 生成加密密码
      let password = encrypt(req.body.password)
      let user = await User.findOne({ name: req.body.name })
      if (!user || user.password !== password) {
        req.flash('error', '用户名或密码错误！')
        return res.redirect('back')
      }
      user.atimes.push(Date.now())
      user.save()
      req.session.user = user
      req.flash('success', '登录成功！')
      return res.redirect('/')
    } catch (e) {
      req.flash('error', '无法登录！')
      return res.redirect('back')
    }
  }

  function reg (req, res) {
    res.render('reg', {
      title: '注册',
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  }

  async function doReg (req, res) {
    try {
      let name = req.body.name.trim()
      let email = req.body.email.trim()
      let password = req.body.password
      let repassword = req.body.repassword

      // 检查空域
      let fields = [ name, email, password, repassword ]
      let blankFields = 0
      for (let field of fields) {
        if (!field || field === '') blankFields++
      }
      if (blankFields !== 0) {
        req.flash('error', '信息填写不全！')
        return res.redirect('back')
      }
      // 检查用户名是否已经存在
      let existUser = await User.findOne({ name })

      if (existUser) {
        req.flash('error', '该用户名已被使用')
        return res.redirect('back')
      }

      // 检查邮箱是否已经被注册
      let existEmail = await User.findOne({ email })
      if (existEmail) {
        req.flash('error', '该邮箱已经被注册')
        return res.redirect('back')
      }

      // 检测用户两次输入的密码是否一致
      if (password !== repassword) {
        req.flash('error', '两次输入的密码不一致！')
        return res.redirect('back')
      }

      let newUser = await User.create({
        name,
        email,
        password: encrypt(password),
        avatar: makeAvatar(email),
        atime: [ Date.now() ]
      })
      req.session.user = newUser
      req.flash('success', '注册成功！')
      return res.redirect('/')
    } catch (e) {
      req.flash('error', '无法注册！')
      return res.redirect('back')
    }
  }

  function logout (req, res) {
    req.session.user = null  // 将session中的用户信息删掉，实现用户退出
    req.flash('success', '退出成功!')
    res.redirect('back')
  }

  async function profile (req, res) {
    try {
      let name = req.params.name
      let existUser = await User.findOne({ name })
      if (!existUser) {
        req.flash('error', '该用户不存在！')
        return res.redirect('back')
      }
      let page = Math.max(req.query.page, 1)
      let total = await Post.find({ name }).count()
      let posts = await Post.find({ name }).sort({ ctime: -1 }).page(page)

      let data = {
        title: name,
        posts,
        page,
        isFirstPage: page === 1,
        isLastPage: (page - 1) * postsPerPage + posts.length === total,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      }
      res.render('user', data)
    } catch (e) {
      console.log(e)
      req.flash('error', '无法获取用户信息！')
      return res.redirect('/')
    }
  }

  return [
    [ '/login', 'get', [ checkNotLogin, login ] ],
    [ '/login', 'post', [ checkNotLogin, doLogin ] ],
    [ '/reg', 'get', [ checkNotLogin, reg ] ],
    [ '/reg', 'post', [ checkNotLogin, doReg ] ],
    [ '/logout', 'get', [ checkLogin, logout ] ],
    [ '/u/:name', 'get', [ profile ] ]
  ]
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/user', 'models/post', 'routes/common', 'lib/encrypt', 'lib/avatar', 'settings' ]
