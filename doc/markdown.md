在 Node.js 中使用 Markdown
==========================

使用 markdown 模块
------------------

1. 安装 markdown 模块  
在`package.json`中，`dependencies:{}`一项中加入`"markdown":"*"`，并使用`$ npm install`安装模块；

2. 转换 md 为 html
```javascript
var markdown = require('markdown').markdown;
markdown.toHTML(mdDoc);
```
