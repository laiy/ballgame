(function() {

    var maxWidth = 1024;
    var maxHeight = 768;
    var ballObjects = [];
    var usersBall = [];
    var usersCount = 0;
    var ballCount = 20;
    var ballImage = new Image();
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var userHasStartedTheGame = false;
    var minute = 0;
    var second = 0;
    var hour = 0;
    var millisecond = 0;
    var timingClock = document.getElementById('timing');
    var socket = io.connect('http://172.18.182.71/');
    var pagesNickname = "";
    var usersImage = new Image();
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    var rankingNickname = document.getElementsByName('ranking-nickname');
    var rankingScore = document.getElementsByName('ranking-score');
    var cover = document.getElementById('cover');
    var upload = document.getElementById('upload');
    var ranking = document.getElementById('ranking');
    var cancleButton = document.getElementById('cancle');
    var showButton = document.getElementById('show-ranking');
    var tempRecord = document.getElementById('temp-record');
    var sendButton = document.getElementById('chat-upload');
    var userChat = document.getElementById('user-chat');
    var chatContent = document.getElementById('chat-text');
    var canvasLeft;
    var canvasTop;
    var left = 0;
    var top = 0;
    var windowHeight = window.screen.availHeight;
    var windowWidth = window.screen.availWidth;
    var windowVerticalPosition = [];
    var bulletsCount = 0;
    var htmlBullets = [];
    ballImage.src = 'images/dust-fairy.png';
    usersImage.src = 'images/totoro233.png';

    function initialCanvasLocation() {
        canvasLeft = getElementLeft(canvas);
        canvasTop = getElementTop(canvas);
    }

    function getElementLeft(element) {
        var actualLeft = element.offsetLeft;
        var current = element.offsetParent;
        while (current !== null) {
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }
        return actualLeft;
    }

    function getElementTop(element) {
        var actualTop = element.offsetTop;
        var current = element.offsetParent;
        while (current !== null) {
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    }

    function gameOver() {
        for (var j = 0; j < usersCount; j++) {
            if (usersBall[j].nickname === pagesNickname && usersBall[j].show) {
                for (var i = 0; i < ballCount; i++) {
                    if (Math.pow(ballObjects[i].Pointx - usersBall[j].Pointx, 2) + Math.pow(ballObjects[i].Pointy - usersBall[j].Pointy, 2) < Math.pow(50, 2)) {
                        canvas.style.cursor = "default";
                        userHasStartedTheGame = false;
                        usersBall[j].show = false;
                        usersBall[j].Pointx = -100;
                        usersBall[j].Pointy = -100;
                        socket.emit('changeUsersBall', usersBall);
                        getScoreAndEmit();
                    }
                }
            }
        }
    }

    function getScoreAndEmit() {
        var score = millisecond + 60 * second + 3600 * minute + hour * 216000;
        var data = [];
        data[0] = score;
        data[1] = pagesNickname;
        socket.emit('score', data);
        tempRecord.innerHTML = "Your score : " + toScore(score);
    }

    function draw() {
        context.clearRect(0, 0, maxWidth, maxHeight);
        for (var i = 0; i < ballCount; i++) {
            context.drawImage(ballImage, ballObjects[i].Pointx - 25, ballObjects[i].Pointy - 25);
        }
        context.strokeStyle = "rgba(255, 255, 255, 0.7)";
        context.fillStyle = "rgba(255, 255, 255, 0.9)";
        context.font = "18px bolder Tahoma";
        context.save();
        context.lineWidth = 2;
        for (var i = 0; i < usersCount; i++) {
            if (usersBall[i].show) {
                var textWidth = context.measureText(usersBall[i].nickname).width;
                gameOver();
                context.drawImage(usersImage, usersBall[i].Pointx - 25, usersBall[i].Pointy - 25);
                if (usersBall[i].Pointx < 512) {
                    context.beginPath();
                    context.moveTo(usersBall[i].Pointx + 20, usersBall[i].Pointy - 20);
                    context.lineTo(usersBall[i].Pointx + 32, usersBall[i].Pointy - 32);
                    context.lineTo(usersBall[i].Pointx + 42 + textWidth, usersBall[i].Pointy - 32);
                    context.stroke();
                    context.shadowOffsetX = 0;
                    context.shadowOffsetY = 0;
                    context.shadowColor = '#FFF';
                    context.shadowBlur = 5;
                    context.fillText(usersBall[i].nickname, usersBall[i].Pointx + 32, usersBall[i].Pointy - 37);
                    context.restore();
                } else {
                    context.beginPath();
                    context.moveTo(usersBall[i].Pointx - 20, usersBall[i].Pointy - 20);
                    context.lineTo(usersBall[i].Pointx - 32, usersBall[i].Pointy - 32);
                    context.lineTo(usersBall[i].Pointx - 42 - textWidth, usersBall[i].Pointy - 32);
                    context.stroke();
                    context.shadowOffsetX = 0;
                    context.shadowOffsetY = 0;
                    context.shadowColor = '#FFF';
                    context.shadowBlur = 5;
                    context.fillText(usersBall[i].nickname, usersBall[i].Pointx - 42 - textWidth, usersBall[i].Pointy - 37);
                    context.restore();
                }
            }
        }
        requestAnimationFrame(draw);
    }

    function dragANewBall(obj) {
        document.onmousemove = function(ev) {
            left = ev.pageX - canvasLeft;
            top = ev.pageY - canvasTop;
            if (!(left < 25 || left > maxWidth - 25)) {
                obj.Pointx = left;
            }
            if (!(top < 25 || top > maxHeight - 25)) {
                obj.Pointy = top;
            }
            var data = [];
            data[0] = obj.Pointx;
            data[1] = obj.Pointy;
            data[2] = obj.nickname;
            socket.emit('userOnMouseMove', data);
        }
    }

    function timing() {
        millisecond++;
        if (millisecond === 60) {
            second++;
            millisecond = 0;
        }
        if (second === 60) {
            minute++;
            second = 0;
        }
        if (minute === 60) {
            hour++;
            minute = 0;
        }
        timingClock.innerHTML = hour + " : " + minute + " ' " + second + " '' " + millisecond;
        if (userHasStartedTheGame) {
            setTimeout(timing, 1000 / 60);
        } else {
            minute = 0;
            second = 0;
            hour = 0;
            millisecond = 0;
            timingClock.innerHTML = hour + " : " + minute + " ' " + second.toFixed(0) + " ''";
        }
    }

    window.onload = function() {
        canvas.onmousedown = function(ev) {
            for (var i = 0; i < usersCount; i++) {
                if (usersBall[i].nickname === pagesNickname && ev.offsetX >= 25 && ev.offsetX <= maxWidth - 25 && ev.offsetY >= 25 && ev.offsetY <= maxHeight - 25) {
                    dragANewBall(usersBall[i]);
                    usersBall[i].show = true;
                    usersBall[i].Pointx = ev.offsetX;
                    usersBall[i].Pointy = ev.offsetY;
                    userHasStartedTheGame = true;
                    socket.emit('changeUsersBall', usersBall);
                    socket.emit('backgroundTimeStart', usersBall[i]);
                    timing();
                    canvas.style.cursor = "none";
                    break;
                }
            }
        };
        document.getElementById('log-in').addEventListener('click', uploadNickname);
        upload.onkeydown = function(moz_ev) {
            if (moz_ev.keyCode === 13 || (moz_ev.keyCode === 13 && ev.ctrlKey)) {
                uploadNickname();
            }
        }
        cancleButton.addEventListener('click', cancleRankingBox);
        showButton.addEventListener('click', showRankingBox);
        sendButton.addEventListener('click', sendMessages);
        initialCanvasLocation();
        for (var i = 0; i < windowHeight - 50; i++) {
            windowVerticalPosition[i] = 0;
        }
    }

    function sendMessages() {
        var msg = document.getElementById('user-chat').value;
        if (msg) {
            userChat.value = "";
            var data = [];
            data[0] = pagesNickname;
            data[1] = msg;
            socket.emit('newChatMessage', data);
        }
    }

    function cancleRankingBox() {
        cover.style.display = "none";
        ranking.style.display = "none";
    }

    function showRankingBox() {
        cover.style.display = "block";
        ranking.style.display = "block";
    }

    function uploadNickname() {
        if (document.getElementById('user-nickname').value) {
            var nickname = document.getElementById('user-nickname').value;
            pagesNickname = nickname;
            socket.emit('userNickname', nickname);
            document.getElementById('user-nickname').value = "";
            cover.style.display = "none";
            upload.style.display = "none";
        }
        draw();
    }

    socket.on('changeUsersBall', function (data) {
        usersBall = data;
        usersCount = data.length;
    });

    socket.on('commonBallsData', function (data) {
        ballObjects = data;
    });

    socket.on('ranking', function (data) {
        if (data.length >= 10) {
            for (var i = 0; i < 10; i++) {
                $(rankingNickname[i]).text(data[i].top[1]);
                rankingScore[i].innerHTML = toScore(data[i].top[0]);
            }
        } else {
            for (var i = 0; i < data.length; i++) {
                $(rankingNickname[i]).text(data[i].top[1]);
                rankingScore[i].innerHTML = toScore(data[i].top[0]);
            }
        }
    });

    socket.on('updateChattingMessage', function (data) {
        updateChatContent(data);
    });

    socket.on('updateInitialChattingMessage', function (data) {
        updateInitialChatContent(data);
    });

    socket.on('warning', function() {
        alert("Don't cheat! Buddy!");
    });

    socket.on('uploadAndUpdateChatContent', function (data) {
        uploadAndUpdateChatContent(data);
    });

    function updateChatContent(data) {
        var content = "";
        for (var i = 0; i < data.length; i++) {
            content += data[i].dbMsg + "&#10;";
            if (i === data.length - 1) {
                showBulletCurtain(data[i].dbMsg);
            }
        }
        chatContent.innerHTML = content;
        chatContent.scrollTop = chatContent.scrollHeight;
        userChat.focus();
    }

    function updateInitialChatContent(data) {
        var content = "";
        for (var i = 0; i < data.length; i++) {
            content += data[i].dbMsg + "&#10;";
            if (i === data.length - 1) {
                showBulletCurtain(data[i].dbMsg);
            }
        }
        chatContent.innerHTML = content;
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    function uploadAndUpdateChatContent(data) {
        var content = "";
        for (var i = 0; i < data.length; i++) {
            content += data[i].dbMsg + "&#10;";
        }
        chatContent.innerHTML = content;
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    function showBulletCurtain(dbMsg) {
        // var index = dbMsg.indexOf(" : ") + 3;
        var message = dbMsg;
        var numberAllRight = false;
        var count = 0;
        var randomTop;
        var div = document.createElement('div');
        var span = document.createElement('span');
        var loopCount = 0;
        // while (dbMsg[index]) {
        //     message += dbMsg[index];
        //     index++;
        // }
        while (!numberAllRight) {
            randomTop = parseInt(Math.random() * (windowHeight - 100));
            for (var i = randomTop; i < randomTop + 50; i++) {
                if (windowVerticalPosition[i] === 0) {
                    count++;
                }
            }
            if (count === 50) {
                numberAllRight = true;
                for (var i = randomTop; i < randomTop + 50; i++) {
                    windowVerticalPosition[i] = 1;
                }
            } else {
                count = 0;
            }
            loopCount++;
            if (loopCount >= 20) {
                return;
            }
        }
        div.setAttribute('name', 'bullet-curtain');
        div.className = 'bullet-curtain';
        span.setAttribute('name', 'bullet-content');
        $(span).text(message);
        document.body.appendChild(div);
        div.appendChild(span);
        htmlBullets = document.getElementsByName('bullet-curtain');
        htmlBullets[bulletsCount].style.top = randomTop + "px";
        htmlBullets[bulletsCount].style.left = windowWidth + "px";
        htmlBullets[bulletsCount].top = randomTop;
        htmlBullets[bulletsCount].width = htmlBullets[bulletsCount].offsetWidth;
        shootBullet(htmlBullets[bulletsCount], windowWidth);
        // $(htmlBullets[bulletsCount]).animate({left:'-200px'}, 4000, function() {
        //     document.body.removeChild(this);
        //     bulletsCount--;
        //     for (var i = randomTop; i < randomTop + 50; i++) {
        //         windowVerticalPosition[i] = 0;
        //     }
        // })
        bulletsCount++;
    }

    function shootBullet(obj, position) {
        position -= 8;
        obj.style.left = position + "px";
        if (position < -obj.width) {
            document.body.removeChild(obj);
            bulletsCount--;
            for (var i = obj.top; i < obj.top + 50; i++) {
                windowVerticalPosition[i] = 0;
            }
        } else {
            requestAnimationFrame(function() {
                shootBullet(obj, position);
            });
        }
    }

    userChat.onkeydown = function(moz_ev) {
        if (moz_ev.keyCode === 13 || (moz_ev.keyCode === 13 && ev.ctrlKey)) {
            moz_ev.preventDefault();
            sendMessages();
        }
    }

    function toScore(score) {
        var ms = score % 60;
        var s = parseInt(score / 60) % 60;
        var min = parseInt(score / 3600) % 60;
        var hr = parseInt(score / 216000) % 60;
        return hr + " : " + min + " ' " + s + " '' " + ms;
    }

})();


