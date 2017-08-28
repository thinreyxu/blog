module.exports = (crypto) => {
  const { md5 } = crypto
  const defaultPhrase = 'Mr(s).Nobody'

  function makeAvatar (phrase = defaultPhrase) {
    let phraseMd5 = md5(phrase.toLowerCase())
    let avatar = `https://s.gravatar.com/avatar/${phraseMd5}`
    return avatar
  }

  return { makeAvatar }
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'lib/encrypt' ]
