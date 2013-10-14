在 Express 中使用 flash
=======================

这里所说的 flash 指的是页面通知，是 session 中用于存储信息的特定区域。写入 flash 的信息，在下次显示完毕后即被清除。典型的应用是配合重定向，将信息提供给接下来要渲染的页面。

在 Express 中，通过 connect-flash 模块实现。


使用 connect-flash
------------------

1. 安装 connect-flash 模块  
在`package.json`中，`dependencies:{}`一项中加入`"connect-flash":"*"`，并使用`$ npm install`安装模块；

2. 使用 connect-flash 模块
```javascript
var flash = require('connect-flash');
app.use(flash());
```

3. 设置和获取 flash 信息
```javascript
// 设置 flash 信息
req.flash('name', 'value');
// 获取 flash 信息
req.flash('name');
```