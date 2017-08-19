module.exports = (odm) => {
  const userSchema = odm.Schema({
    name: { type: String, index: true, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: true },
    ctime: { type: Date, default: Date.now, required: true },
    utimes: [ Date ]
  })

  const User = odm.model('User', userSchema, 'users')

  return User
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'models/odm' ]

/*
if (require.main === module) {
  let now = new Date()
  let user1 = new User({
    name: 'lex',
    password: 'lex',
    email: 'lex@lo.ho',
    avatar: 'null',
    ctime: now,
    utimes: [now]
  })

  user1.save()
    .then(user => {
      console.log(user._id)
    })
    .catch(err => {
      console.error(err)
    })

  User.findOne({})
    .then(user => {
      console.log(user)
    })
    .catch(err => {
      console.error(err)
    })
}
*/
