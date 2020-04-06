var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var webSocket = require('./websocket.js')
var jwt = require('jsonwebtoken')
var {
	secret
} = require('./config')
app.use(express.static('./public'));
// 引入路由模块
var LoginRouter = require('./routes/login.js')
var AlbumRouter = require('./routes/album.js');
var BlogRouter = require('./routes/blog.js');
var UserRouter = require('./routes/user.js');
// 使用路由模块，中间件
app.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", ' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});
app.all("*", function (req, res, next) {
	var token = req.headers.token
	var isGet = req.method == 'GET'
	// 游客不需要验证
	if (req.path == '/api/album/upload') {
		next()
	} else if (token == '5e3fd7109ce3d27781b07b92' && req.path != '/api/login/user') {
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
