module.exports = (User, Post, common, crypto, avatar) => {
  const { checkNotLogin, checkLogin } = common
  const { md5WithSalt: encrypt } = crypto
  const { makeAvatar } = avatar

  function login (req, res) {
    res.render('login', {
      title: '登录'
    })
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
    console.log(req.body)
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
      let existUser = await User.find({ name })
      if (existUser) {
        req.flash('error', '该用户名已被使用')
        return res.redirect('back')
      }

      // 检查邮箱是否已经被注册
      let existEmail = await User.find({ email })
      if (existEmail) {
        req.flash('error', '该邮箱已经被注册')
        return res.redirect('back')
      }

      // 检测用户两次输入的密码是否一致
      if (password !== repassword) {
        req.flash('error', '两次输入的密码不一致！')
        return res.redirect('back')
      }

      let newUser = await new User({
        name,
        email,
        password: encrypt(password),
        avatar: makeAvatar(email)
      }).save()
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
      let existUser = await User.getByName({ name })
      if (!existUser) {
        req.flash('error', '该用户不存在！')
        return res.redirect('back')
      }
      let page = req.query.page || 1
      let { posts, total } = await Post.getByPage({ name, page })
      res.render('user', {
        title: name,
        posts,
        page,
        isFirstPage: page === 1,
        isLastPage: (page - 1) * 5 + posts.length === total,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      })
    } catch (e) {
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
module.exports['@require'] = [ 'models/user', 'modelsOld/post', 'routes/common', 'lib/encrypt', 'lib/avatar' ]
