const fs = require('fs')
const common = require('./common')
const multer = require('multer')
const uploadDir = './public/uploads'
const uploader = multer({ dest: uploadDir })
const uploadMultiple = uploader.array('file')

module.exports = {
  '/upload': {
    'get': [ common.checkLogin, upload ],
    'post': [ common.checkLogin, uploadMultiple, doUpload ]
  }
}

function upload (req, res) {
  res.render('upload', {
    title: '上传文件',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  })
}

function doUpload (req, res) {
  let files = req.files
  for (let file of files) {
    if (file.size === 0) {
      fs.unlinkSync(file.path)
      console.log('Successfully removed an empty file!')
    } else {
      let targetPath = uploadDir + '/' + file.originalname.toLowerCase()
      fs.renameSync(file.path, targetPath)
      console.log('Successfully renamed a file!')
    }
  }
  req.flash('success', '文件上传成功！')
  res.redirect('/upload')
}
