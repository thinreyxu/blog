const marked = require('marked')
const hljs = require('highlight.js')
const { JSDOM } = require('jsdom')

class Marked {
  constructor (options = {}) {
    this.options = Object.assign({}, Marked.defaultOptions, options)
    marked.setOptions(this.options)
  }

  makeMd (markdownString, options = {}) {
    const tmpOptions = Object.assign({}, this.options, options)
    return new Promise((resolve, reject) => {
      marked(markdownString, tmpOptions, (err, data) => {
        if (err) return reject(err)
        return resolve(data)
      })
    })
  }

  makeSummary (markdownString, options = {}) {
    const tmpOptions = Object.assign({}, this.options, options)
    return new Promise((resolve, reject) => {
      marked(markdownString, tmpOptions, (err, htmltext) => {
        if (err) return reject(err)

        let minLength = tmpOptions.minLength
        let theta = tmpOptions.theta
        let sentenceEnd = tmpOptions.sentenceEnd

        let dom = new JSDOM(htmltext)
        let summary = dom.window.document.body.textContent
        if (summary.length > minLength) {
          let stop = summary.substring(minLength - theta, minLength + theta).search(sentenceEnd)
          summary = stop !== -1 ? summary.substring(0, minLength - theta + stop) : summary.substring(0, minLength)
          summary = summary.trim() + ' …'
        }
        resolve(summary)
      })
    })
  }
}

Marked.defaultOptions = {
  // summary options
  minLength: 300,
  theta: 20,
  sentenceEnd: /[.:,.;~![\]{}()?"'：”、，。；！？……\s]/,
  // marked options below
  gfm: true,
  highlight: (code, lang) => lang
      ? hljs.highlight(lang, code).value
      : hljs.highlightAuto(code).value,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  langPrefix: 'lang-'
}

const md = new Marked()
const makeMd = (...args) => md.makeMd(...args)
const makeSummary = (...args) => md.makeSummary(...args)

module.exports = { makeMd, makeSummary, Marked }
