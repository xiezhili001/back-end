var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var url = 'mongodb://127.0.0.1:27017/';

router.post('/add', function (req, res) {
  // 1. 获取前端传递过来的参数
  var html = req.body.html;
  var classify = req.body.classify;
  var blogTitle = req.body.blogTitle;

  // 3. 链接数据库做验证
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      console.log('连接失败', err);
      res.json({
        code: 1,
        msg: '网络异常, 请稍候重试'
      })
      return;
    }

    var db = client.db('myBlog');
    db.collection('blog').insertOne({
      html,
      classify,
      blogTitle
    }, function (err, data) {
      if (err) {
        res.json({
          code: 1,
          msg: '错误'
        })
      } else {
        res.json({
          code: 0,
          msg: 'OK',
        })
      }
      client.close();
    })
  })
});

router.get('/list', function (req, res) {
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
          db.collection('blog').find().count(function (err, num) {
            if (err) {
              cb(err);
            } else {
              cb(null, num);
            }
          })
        },
        function (num, cb) {
          db.collection('blog').find().toArray(function (err, data) {
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
              blog: result.data,
              total: result.num
            }
          })
        }
        client.close();
      })
    }
  })
})
module.exports = router;
