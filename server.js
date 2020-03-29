var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var webSocket = require('./websocket.js')
var jwt = require('jsonwebtoken')
var {
	secret
} = require('./config')
app.use(express.static('./'));
// 引入路由模块
var LoginRouter = require('./routes/login.js')
var AlbumRouter = require('./routes/album.js');
var BlogRouter = require('./routes/blog.js');
var UserRouter = require('./routes/user.js');
// 使用路由模块，中间件
app.all("*", function (req, res, next) {
	//设置允许跨域的域名，*代表允许任意域名跨域
	res.header("Access-Control-Allow-Origin", "*");
	//允许的header类型
	res.header("Access-Control-Allow-Headers", "content-type");
	//跨域允许的请求方式
	res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
	var token = req.headers.token
	var isGet = req.method == 'GET'
	// 游客不需要验证
	if (token == '5e3fd7109ce3d27781b07b92' && req.path != '/api/login/user') {
		if (isGet) {
			next();
		} else {
			res.json({
				code: 1,
				msg: '你尚未有提交权限'
			})
		}
	} else {
		jwt.verify(token, secret, function (error, data) {
			if (error && req.path != '/api/login/user') {
				return res.json({
					code: 1,
					msg: 'token无效'
				})
			}
			next()
		})
	}
})
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use('/api/blog/', BlogRouter);
app.use('/api/login/', LoginRouter);
app.use('/api/album/', AlbumRouter);
app.use('/api/user/', UserRouter);

let server = app.listen(3000);
webSocket(server)

console.log('服务启动成功');
