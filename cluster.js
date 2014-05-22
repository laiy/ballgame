var cluster = require('cluster');
var cpus = require('os').cpus().length;

if (cluster.isMaster) {
  for (var i = 0; i < cpus; i++) {
    cluster.fork();
    var server = require('http').createServer();
    var io = require('socket.io').listen(server);
    var fs = require('fs');

    var RedisStore = require('socket.io/lib/stores/redis');
    var redis = require('socket.io/node_modules/redis');

    io.set('store', new RedisStore({
      edisPub: redis.createClient(),
      redisSub: redis.createClient(),
      redisClient: redis.createClient()
    }));
  }
} else {
  require('./app').start();
}
