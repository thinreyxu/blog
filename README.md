blog
====

根据 [nswbmw](https://github.com/nswbmw) 的 [N-blog 教程](https://github.com/nswbmw/N-blog/wiki/_pages)搭建的博客，正在借由这个项目学习 node web 开发。

在教程基础上，做了一些修改，具体如下：

**markdown 解析 & 代码高亮**  
使用 [marked][1] 模块替换原来的 markdown 模块，从而实现了对 GFM（Github Flavored Markdown） 的支持以及异步解析 markdown 文本。使用 [highlight.js][2] 模块配合 [marked][1] 实现代码高亮的功能，并以 andyferra 分享的 gist [github.css][3] 代码为蓝本，修改得到目前的博客文章样式。

**博客标签**  
修改博客标签功能，将需要三个输入框，最多只能输入三个标签的形式，修改为使用一个输入框，以‘,’为间隔的多标签形式。

[1]: https://github.com/chjj/marked 'marked'
[2]: https://github.com/isagalaev/highlight.js 'highlight.js'
[3]: https://gist.github.com/andyferra/2554919 'andyferra / github.css'