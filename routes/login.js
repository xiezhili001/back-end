var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/';
var jwt = require('jsonwebtoken')
var {
  secret
} = require('../config')
// 登录  location:3000/api/login/user
router.post('/user', function (req, res) {
  // 1. 获取前端传递过来的参数
  var userName = req.body.userName;
  var password = req.body.password;

  // 2. 验证参数的有效性
  if (!userName) {
    res.json({
      code: 1,
      msg: '用户名不能为空'
    })
    return;
  }
  if (!password) {
    res.json({
      code: 1,
      msg: '密码不能为空'
    })
    return;
  }

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
    console.log(userName);
    console.log(password);
    db.collection('user').find({
      userName: userName,
      password: password
    }).toArray(function (err, data) {
      if (err) {
        console.log('查询失败', err);
        res.json({
          code: 1,
          msg: '网络异常, 请稍候重试'
        })
      } else if (data.length <= 0) {
        res.json({
          code: 1,
          msg: '用户名或密码错误'
        })
      } else {
        var token = jwt.sign({
          data: String(data[0]._id),
        }, secret, {
          expiresIn: 60
        })
        res.json({
          code: 0,
          msg: '登录成功',
          data: {
            user: data[0],
            token
          }
        })
      }
      client.close();
    })

  })
});


module.exports = router;
