var fs = require('fs');
var common = require('./common');
var uploadDir = './public/upload';
var dirExist = false;

module.exports = {
  '/upload': {
    'get': [ common.checkLogin, upload ],
    'post': [ common.checkLogin, doUpload ]
  }
};

function upload (req, res) {
  res.render('upload', {
    title: '上传文件',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
}

function doUpload (req, res) {
  // if (!dirExist) {
  //   fs.readdir(uploadDir, function (err, files) {
  //     if (err) {
  //       createDir(uploadDir, function (err) {
  //         if (!err) {
  //           dirExist = true;
  //           doUpload(req, res);
  //         }
  //       });
  //     }
  //     else {
  //       dirExist = true;
  //       doUpload(req, res);
  //     }
  //   })
  //   return;
  // }
  for (var i in req.files) {
    if (req.files[i].size == 0) {
      // 使用同步方式删除一个文件
      fs.unlinkSync(req.files[i].path);
      console.log('Successfully removed an empy file!');
    }
    else {
      var target_path = './public/upload/' + req.files[i].name;
      // 使用同步的方式重命名一个文件
      fs.renameSync(req.files[i].path, target_path);
      console.log('Successfully renamed a file!');
    }
  }
  req.flash('success', '文件上传成功！');
  res.redirect('/upload');
}

function createDir (path, callback) {
  var paths = typeof path === 'string' ? path.split('/') : path;

  path = paths.shift();
  if (path.length) {
    fs.readdir(path, function (err, files) {
      if (err) {
        fs.mkdir(path, function (err) {
          if (!err) {
            createDir(paths, callback);
          }
          else {
            callback(err);
          }
        });
      }
      else {
        createDir(paths, callback);
      }
    });
  }
  else {
    callback(null);
  }
}