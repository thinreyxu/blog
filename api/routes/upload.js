module.exports = (fs, multer, common) => {
  const { checkLogin } = common
  const uploadDir = './uploads'
  const fieldname = 'file'
  const uploader = multer({ dest: uploadDir })
  const uploadMultiple = uploader.array(fieldname)

  function upload (req, res) {
    res.render('upload', {
      title: '上传文件'
    })
  }

  async function doUpload (req, res) {
    try {
      let files = req.files
      for (let file of files) {
        if (file.size === 0) {
          await fs.unlink(file.path)
          console.log('Successfully removed an empty file!')
        } else {
          let targetPath = uploadDir + '/' + file.originalname.toLowerCase()
          await fs.rename(file.path, targetPath)
          console.log('Successfully renamed a file!')
        }
      }
      req.flash('success', '文件上传成功！')
      res.redirect('/upload')
    } catch (err) {
      throw err
    }
  }

  return [
    [ '/upload', 'get', [ checkLogin, upload ] ],
    [ '/upload', 'post', [ checkLogin, uploadMultiple, doUpload ] ]
  ]
}
module.exports['@singleton'] = true
module.exports['@require'] = [ 'fs-extra', 'multer', 'routes/common' ]
