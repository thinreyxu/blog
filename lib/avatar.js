const { md5 } = require('./encrypt')
const defaultPhrase = 'Mr(s).Nobody'

function makeAvatar (phrase = defaultPhrase) {
  let phraseMd5 = md5(phrase.toLowerCase())
  let avatar = `https://s.gravatar.com/${phraseMd5}`
  return avatar
}

module.exports = { makeAvatar }
