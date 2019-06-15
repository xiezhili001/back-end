var express = require('express');
var app = express();

// 引入路由模块
var FilmRouter = require('./routes/film.js');
var UserRouter = require('./routes/user.js');
var DetailRouter = require('./routes/detail.js');
var LoginRouter =  require('./routes/login.js')
// 使用路由模块，中间件
app.all("*",function(req,res,next){
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin","*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers","content-type");
  //跨域允许的请求方式
  res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == 'options')
      res.send(200);  //让options尝试请求快速结束
  else
      next();
})

app.use('/api/film/', FilmRouter);
app.use('/api/user/', UserRouter);
app.use('/api/detail/', DetailRouter);
app.use('/api/login/', LoginRouter);



app.listen(4000);
console.log('服务启动成功');
