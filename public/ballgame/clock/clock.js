window.onload = function() {
  clock();
}

function clock() {
  var now = new Date();
  var ctx = document.getElementById('canvas').getContext('2d');
  ctx.save();
  ctx.clearRect(0, 0, 800, 800);
  ctx.translate(400, 400);
  ctx.scale(0.4, 0.4);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";
  ctx.lineWidth = 20;
  ctx.lineCap = "round";

  // Hour marks
  ctx.save();
  for (var i = 0; i < 12; i++){
    ctx.beginPath();
    ctx.rotate(Math.PI / 6);
    ctx.moveTo(600, 0);
    ctx.lineTo(800, 0);
    ctx.stroke();
  }
  ctx.restore();

  // Minute marks
  ctx.save();
  ctx.lineWidth = 10;
  for (i = 0; i < 60; i++){
    if (i % 5 != 0) {
      ctx.beginPath();
      ctx.moveTo(750, 0);
      ctx.lineTo(800, 0);
      ctx.stroke();
    }
    ctx.rotate(Math.PI / 30);
  }
  ctx.restore();

  var sec = now.getSeconds();
  var min = now.getMinutes();
  var hr  = now.getHours();
  hr = hr >= 12 ? hr - 12 : hr;

  ctx.fillStyle = "black";

  // write Hours
  ctx.save();
  ctx.rotate( hr * (Math.PI / 6) + (Math.PI / 360) * min + (Math.PI / 21600) * sec);
  ctx.lineWidth = 60;
  ctx.beginPath();
  ctx.moveTo(-100, 0);
  ctx.lineTo(400, 0);
  ctx.stroke();
  ctx.restore();

  // write Minutes
  ctx.save();
  ctx.rotate( (Math.PI / 30) * min + (Math.PI / 1800) * sec);
  ctx.lineWidth = 40;
  ctx.beginPath();
  ctx.moveTo(-70, 0);
  ctx.lineTo(700, 0);
  ctx.stroke();
  ctx.restore();

  // Write seconds
  ctx.save();
  ctx.rotate(sec * Math.PI / 30);
  ctx.strokeStyle = "#D40000";
  ctx.fillStyle = "#D40000";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-200, 0);
  ctx.lineTo(870, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(150, 0, 20, 0, Math.PI * 2,true);
  ctx.stroke();
  ctx.fillStyle = "#555";
  ctx.arc(0, 0, 5, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.lineWidth = 20;
  ctx.strokeStyle = '#325FA2';
  ctx.arc(0, 0, 900, 0, Math.PI * 2, true);
  ctx.stroke();

  ctx.restore();

  setTimeout(clock, 1000);
}
