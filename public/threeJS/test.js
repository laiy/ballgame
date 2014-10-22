var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;
    
var scene = null;
var camera = null;
var renderer = null;
var id = null;
var stat = null;
var ballMesh = null;
var ballRadius = 0.5;
var isMoving = false;
var maxHeight = 5;
var v = 0;
var a = -0.01;
var cPositionX = 10;
var cPositionY = 30;
var cPositionZ = 10;


function init() {
    stat = new Stats();
    stat.domElement.style.position = 'fixed';
    stat.domElement.style.left = '0px';
    stat.domElement.style.top = '0px';
    document.body.appendChild(stat.domElement);
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('mainCanvas')
    });
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-5, 5, 3.75, -3.75, 0.1, 100);
    camera.position.set(cPositionX, cPositionY, cPositionZ);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);
    ballMesh = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 16, 8), 
        new THREE.MeshLambertMaterial({
            color: 0xEEEEEE
    }));
    ballMesh.position.y = ballRadius;
    ballMesh.position.x = 0;
    ballMesh.position.z = 0;
    scene.add(ballMesh);
    var texture = THREE.ImageUtils.loadTexture('chess.png', {}, function() {
        renderer.render(scene, camera);
    });
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    var plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5),
            new THREE.MeshLambertMaterial({map: texture}));
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(10, 10, 15);
    scene.add(light);
    id = requestAnimationFrame(draw);
}

function draw() {
    stat.begin();
    if (isMoving) {
        ballMesh.position.y += v;
        v += a;
        if (ballMesh.position.y <= ballRadius) {
            v = -v * 0.9;
        }
        if (Math.abs(v) < 0.001) {
            isMoving = false;
            ballMesh.position.y = ballRadius;
        }
    }
    renderer.render(scene, camera);
    id = requestAnimationFrame(draw);
    camera.lookAt(new THREE.Vector3(ballMesh.position.x, ballMesh.position.y, ballMesh.position.z));
    stat.end();
}

function stop() {
    if (id !== null) {
        cancelAnimationFrame(id);
        id = null;
    }
}

function drop() {
    isMoving = true;
    ballMesh.position.y = maxHeight;
    v = 0;
}

document.onkeydown = function (moz_ev) {
    var ev = null;
    if (window.event) {
        ev = window.event;
    } else {
        ev = moz_ev;
    }
    if (ev !== null && ev.keyCode == 37) {
        camera.position.set(--cPositionX, cPositionY, cPositionZ);
    }
    if (ev !== null && ev.keyCode == 38) {
        camera.position.set(cPositionX, cPositionY, --cPositionZ);
    }
    if (ev !== null && ev.keyCode == 39) {
        camera.position.set(++cPositionX, cPositionY, cPositionZ);
    }
    if (ev !== null && ev.keyCode == 40) {
        camera.position.set(cPositionX, cPositionY, ++cPositionZ);
    }
    if (ev !== null && ev.keyCode == 38 && ev.ctrlKey) {
        camera.position.set(cPositionX, ++cPositionY, cPositionZ);
    }
    if (ev !== null && ev.keyCode == 40 && ev.ctrlKey) {
        camera.position.set(cPositionX, --cPositionY, cPositionZ);
    }
}

