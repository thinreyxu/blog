var marked = require('marked')
  , hljs = require('highlight.js');

marked.setOptions({
  gfm: true,
  highlight: function (code, lang) {
    return lang ?
      hljs.highlight(lang, code).value :
      hljs.highlightAuto(code).value;
  },
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  langPrefix: 'lang-'
});

function asyncMarked (...args) {
  return new Promise ((resolve, reject) = {
    marked(...args, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}
module.exports = asyncMarked;
