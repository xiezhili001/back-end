function webSocket(server) {
  let io = require('socket.io').listen(server);
  let i = 0;
  let clientMap = {};
  io.on('connection', function (client) {
    console.log('有连接进来了');
    client.id = ++i;
    clientMap[client.id] = client;
    console.log(client.id)

    // 监听消息
    client.on('message', (msg) => {
      // 广播
      gb(msg, client);
    })
  })

  function gb(msg, client) {
    for (var key in clientMap) {
      clientMap[key].send(msg);
    }
  }
}
module.exports = webSocket;
