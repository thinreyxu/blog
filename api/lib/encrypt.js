module.exports = (crypto, settings) => {
  const { encSalt } = settings

  function encrypt (phrase, method = 'md5', form = 'hex') {
    let hash = crypto.createHash(method)
    let encryptedPhrase = hash.update(phrase).digest(form)
    return encryptedPhrase
  }

  const md5 = (phrase) => encrypt(phrase, 'md5')
  const md5WithSalt = (phrase, salt = encSalt) => encrypt(phrase + salt, 'md5')
  const sha256 = (phrase) => encrypt(phrase, 'sha256')

  return { encrypt, md5, md5WithSalt, sha256 }
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'crypto', 'settings' ]
