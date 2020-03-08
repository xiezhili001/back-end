var express = require('express');
var fs = require('fs');
var router = express.Router();
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/';
var multer = require('multer')
// 获取图片列表  http://127.0.0.1:3000/api/album/list
router.get('/list', function (req, res) {
  var pageNum = parseInt(req.query.pageNum) || 1; // 当前第几页
  var pageSize = parseInt(req.query.pageSize) || 10; // 每页显示多少条
  var classify = parseInt(req.query.classify)
  var startTime = parseInt(req.query.startTime)
  var endTime = parseInt(req.query.endTime)

  var param = {};
  if (classify) param.classify = classify
  if (startTime || endTime) param.date = {}
  if (startTime) param.date['$gte'] = startTime
  if (endTime) param.date['$lte'] = endTime

  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      console.log('链接数据库失败', err);
      res.json({
        code: 1,
        msg: '网络异常, 请稍候重试'
      })
    } else {
      var db = client.db('myBlog');
      async.waterfall([
        function (cb) {
          db.collection('album').find(param).count(function (err, num) {
            if (err) {
              cb(err);
            } else {
              cb(null, num);
            }
          })
        },
        function (num, cb) {
          db.collection('album').find(param).skip(pageSize * pageNum - pageSize).limit(pageSize).toArray(function (err, data) {
            if (err) {
              cb(err);
            } else {
              cb(null, {
                num: num,
                data: data
              });
            }
          })
        }
      ], function (err, result) {
        if (err) {
          console.log(err);
          res.json({
            code: 1,
            msg: '错误'
          })
        } else {
          res.json({
            code: 0,
            msg: 'OK',
            data: {
              album: result.data,
              total: result.num
            }
          })
        }
        client.close();
      })
    }
  })
})
router.post('/upload', multer({
  //设置文件存储路径
  dest: 'public/img'
}).array('file', 1), function (req, res, next) { //这里10表示最大支持的文件上传数目
  let files = req.files;
  console.log(files[0]);
  if (files.length === 0) {
    res.json({
      code: 1,
      msg: '上传文件不能为空！'
    })
    return
  } else {
    let file = files[0];
    let fileInfo = {};
    let path = './public/img/' + Date.now().toString() + file.originalname;
    fs.renameSync('./public/img/' + file.filename, path);
    //获取文件基本信息
    console.log(file.mimetype,file.originalname);
    fileInfo.type = file.mimetype;
    fileInfo.name = file.originalame;
    fileInfo.size = file.size;
    fileInfo.path = path;
    res.json({
      code: 0,
      msg: 'OK',
      data: fileInfo
    })
  }
});
module.exports = router;
