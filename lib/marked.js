const marked = require('marked')
const hljs = require('highlight.js')

marked.setOptions({
  gfm: true,
  highlight: function (code, lang) {
    return lang
      ? hljs.highlight(lang, code).value
      : hljs.highlightAuto(code).value
  },
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  langPrefix: 'lang-'
})

function asyncMarked (...args) {
  return new Promise((resolve, reject) => {
    console.log(...args)
    marked(...args, (err, data) => {
      console.log('(((((((((((((((((((((((())))))))))))))))))))))))')
      if (err) return reject(err)
      return resolve(data)
    })
  })
}
module.exports = asyncMarked
