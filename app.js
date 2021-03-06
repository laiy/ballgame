// function appStart() {

var express = require("express");
var app = express();
var querystring = require("querystring");
var http = require('http');
var mongodb = require("mongodb");
var dbServer = new mongodb.Server('localhost', 27017, {auto_reconnect:true});
var db = new mongodb.Db('ballgame', dbServer, {safe:true});
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var ballObjects = [];
var usersBall = [];
var usersCount = 0;
var ballCount = 0;
var collisionDetector = [];
var numberOfCommonBall = 20;
var maxWidth = 1024;
var maxHeight = 768;
// var fs = require('fs');
// var RedisStore = require('socket.io/lib/stores/redis');
// var redis = require('socket.io/node_modules/redis');

function CommonBall() {
    this.Pointx = 0;
    this.Pointy = 0;
    this.vx = 0.3;
    this.vy = 0.3;
}

CommonBall.prototype = {
    radius: 25,
    dataChange: function() {
        this.Pointx += this.vx;
        this.Pointy += this.vy;
    },
    detectCollisionAmongBallAndWall: function() {
        if (this.Pointx <= this.radius) {
            this.vx = Math.abs(this.vx);
        } else if (this.Pointx >= maxWidth - this.radius) {
            this.vx = -Math.abs(this.vx);
        } else if (this.Pointy <= this.radius) {
            this.vy = Math.abs(this.vy);
        } else if (this.Pointy >= maxHeight - this.radius) {
            this.vy = -Math.abs(this.vy);
        }
    }
}

function UserBall() {
  this.Pointx = 0;
  this.Pointy = 0;
  this.nickname = "";
  this.show = false;
  this.backgroundTime = 0;
}

function Detector() {
    this.onCollide = false;
}

function addBall() {
    ballObjects[ballCount] = new CommonBall();
    var numberAllRight = false;
    while (!numberAllRight) {
        var randomNumberX = parseInt(Math.random() * (maxWidth - 25 - 1 + 1) + 1);
        var randomNumberY = parseInt(Math.random() * (maxHeight - 25  - 1 + 1) + 1);
        var numberNotOk = false;
        for (var i = 0; i < ballCount; i++) {
            if (Math.pow(randomNumberX - ballObjects[i].Pointx, 2) + Math.pow(randomNumberY - ballObjects[i].Pointy, 2) <= Math.pow(2 * ballObjects[i].radius, 2)) {
                numberNotOk = true;
                break;
            }
        }
        if (numberNotOk) {
            break;
        } else {
            numberAllRight = true;
        }
    }
    ballObjects[ballCount].Pointx = randomNumberX;
    ballObjects[ballCount].Pointy = randomNumberY;
    ballCount++;
}

function detectCollisionAmongBalls() {
    for (var i = 0; i < ballCount - 1; i++) {
        for (var j = i + 1; j < ballCount; j++) {
            if (Math.pow(ballObjects[i].Pointx - ballObjects[j].Pointx, 2) + Math.pow(ballObjects[i].Pointy - ballObjects[j].Pointy, 2) > 2500) {
                collisionDetector[i][j].onCollide = false;
                collisionDetector[j][i].onCollide = false;
            }
            if (!collisionDetector[i][j].onCollide) {
                if (Math.pow(ballObjects[i].Pointx - ballObjects[j].Pointx, 2) + Math.pow(ballObjects[i].Pointy - ballObjects[j].Pointy, 2) <= 2500) {
                    collision(ballObjects[i], ballObjects[j]);
                    collisionDetector[i][j].onCollide = true;
                    collisionDetector[j][i].onCollide = true;
                }
            }
        }
    }
}

function collision(objx, objy) {
    x1 = objx.Pointx;
    y1 = objx.Pointy;
    x2 = objy.Pointx;
    y2 = objy.Pointy;
    v1x = objx.vx;
    v1y = objx.vy;
    v2x = objy.vx;
    v2y = objy.vy;
    detax = x2 - x1;
    detay = y2 - y1;
    denominator = Math.pow(detax, 2) + Math.pow(detay, 2);
    objx.vx = (v1x * Math.pow(detay, 2) + v2x * Math.pow(detax, 2) + (v2y - v1y) * detax * detay) / denominator;
    objx.vy = (v1y * Math.pow(detax, 2) + v2y * Math.pow(detay, 2) + (v2x - v1x) * detax * detay) / denominator;
    objy.vx = (v1x * Math.pow(detax, 2) + v2x * Math.pow(detay, 2) - (v2y - v1y) * detax * detay) / denominator;
    objy.vy = (v1y * Math.pow(detay, 2) + v2y * Math.pow(detax, 2) - (v2x - v1x) * detax * detay) / denominator;
}

db.open(function(err, db) {
    if (!err) {
        console.log('db connected.');
    } else {
        console.log(err);
    }
    for (var i = 0; i < numberOfCommonBall; i++) {
        addBall();
    }
    for (var i = 0; i < numberOfCommonBall; i++) {
        collisionDetector[i] = new Array();
        for (var j = 0; j < numberOfCommonBall; j++) {
            collisionDetector[i][j] = new Detector();
        }
    }
    commonBallsDataChange();
});

function commonBallsDataChange() {
    detectCollisionAmongBalls();
    for (var i = 0; i < ballCount; i++) {
        ballObjects[i].detectCollisionAmongBallAndWall();
        ballObjects[i].dataChange();
    }
    io.sockets.emit('commonBallsData', ballObjects);
    setTimeout(commonBallsDataChange, 1);
}

io.sockets.on('connection', function (socket) {
    // io.set('commonBallsData', ballObjects, function() {
    //     console.log('RedisStore completed.');
    // });
    io.set("log level", 3);
    socket.on('userNickname', function (data) {
        usersBall[usersCount] = new UserBall();
        usersBall[usersCount].nickname = data;
        usersCount++;
        io.sockets.emit('changeUsersBall', usersBall);
        db.collection('rankingLists', {safe: true}, function(err, collection) {
            if (err) {
                console.log(err);
            } else {
                collection.find().toArray(function(err, docs) {
                    for (var i = 0; i < docs.length - 1; i++) {
                        for (var j = i + 1; j < docs.length; j++) {
                            if (docs[i].top[0] < docs[j].top[0]) {
                                var tmp = docs[i];
                                docs[i] = docs[j];
                                docs[j] = tmp;
                            }
                        }
                    }
                    if (err) {
                        console.log(err);
                    } else {
                        io.sockets.emit('ranking', docs);
                    }
                });
            }
        });
        db.collection('chatMessage', {safe:true}, function(err, collection) {
            if (err) {
                console.log(err);
            } else {
                collection.find().toArray(function(err, docs) {
                    if (err) {
                        console.log(err);
                    } else {
                        io.sockets.emit('uploadAndUpdateChatContent', docs);
                    }
                });
            }
        });
    });
    socket.on('userOnMouseMove', function (data) {
        for (var i = 0; i < usersCount; i++) {
            if (usersBall[i].nickname === data[2]) {
                usersBall[i].Pointx = data[0];
                usersBall[i].Pointy = data[1];
                io.sockets.emit('changeUsersBall', usersBall);
                break;
            }
        }
    });
    socket.on('changeUsersBall', function (data) {
        usersBall = data;
        io.sockets.emit('changeUsersBall', usersBall);
    });
    socket.on('newChatMessage', function (data) {
        db.collection('chatMessage', {safe:true}, function(err, collection) {
            if (err) {
                console.log(err);
            } else {
                var temp = {dbMsg: data[0] + " : " + data[1]};
                // var temp.dbMsg = data[0] + " : " + data[1];
                collection.insert(temp, {safe: true}, function(err, result) {
                    console.log(result);
                    if (err) {
                        console.log(err);
                    } else {
                        collection.find().toArray(function(err, docs) {
                            if (err) {
                                console.log(err);
                            } else {
                                socket.emit('updateChattingMessage', docs);
                                socket.broadcast.emit('updateInitialChattingMessage', docs);
                            }
                        });
                    }
                });
            }
        });
    });
    socket.on('score', function (data) {
        db.collection('rankingLists', {safe: true}, function(err, collection) {
            if (err) {
                console.log(err);
            } else {
                for (var i = 0; i < usersCount; i++) {
                    if (usersBall[i].nickname === data[1]) {
                        if (Math.abs(usersBall[i].backgroundTime - data[0]) <= 1000) {
                            usersBall[i].backgroundTime = 0;
                            var temp = {top: data};
                            collection.insert(temp, {safe: true}, function(err, result) {
                                collection.find().toArray(function(err, docs) {
                                    for (var i = 0; i < docs.length - 1; i++) {
                                        for (var j = i + 1; j < docs.length; j++) {
                                            if (docs[i].top[0] < docs[j].top[0]) {
                                                var tmp = docs[i];
                                                docs[i] = docs[j];
                                                docs[j] = tmp;
                                            }
                                        }
                                    }
                                    if (docs.length > 10) {
                                        var scoreOfTheTenth = docs[9].top[0];
                                        for (var i = 0; i < docs.length; i++) {
                                            if (docs[i].top[0] < scoreOfTheTenth) {
                                                collection.remove({"top.0": docs[i].top[0]}, function(){});
                                            }
                                        }
                                    }
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        io.sockets.emit('ranking', docs);
                                    }
                                });
                            });
                        } else {
                            socket.emit('warning');
                        }
                        break;
                    }
                }
            }
        });
    });
    socket.on('backgroundTimeStart', function (data) {
        for (var i = 0; i < usersCount; i++) {
            if (usersBall[i].nickname === data.nickname) {
                startTiming(usersBall[i]);
                break;
            }
        }
    });
    socket.on('unload', function (data) {
        for (var i = 0; i < usersCount; i++) {
            if (data === usersBall[i].nickname) {
                usersBall[i].nickname = "";
                break;
            }
        }
    });
});

function startTiming(obj) {
    obj.backgroundTime++;
    if (obj.show) {
        setTimeout(function() {
            startTiming(obj);
        }, 15);
    }
}

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));

server.listen(2333);

console.log("Server has been started.");
// var RedisStore = require('socket.io/lib/stores/redis');
// var redis = require('socket.io/node_modules/redis');

// }



// exports.start = function () {
//     appStart();
// };
