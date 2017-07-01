const crypto = require('crypto')
const { enc_salt: defaultSalt } = require('../settings')

function encrypt (phrase, method = 'md5', form = 'hex') {
  let hash = crypto.createHash(method)
  let encryptedPhrase = hash.update(phrase).digest(form)
  return encryptedPhrase
}

const md5 = (phrase) => encrypt(phrase, 'md5')
const md5WithSalt = (phrase, salt = defaultSalt) => encrypt(phrase + salt, 'md5')
const sha256 = (phrase) => encrypt(phrase, 'sha256')

module.exports = { encrypt, md5, md5WithSalt, sha256 }
