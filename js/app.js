var App;
(function (App) {
    var MIN_WIDTH = 240;
    var MIN_HEIGHT = 135;
    var realCanvas, realCtx, canvas, ctx, paused = false;
    function resizeCanvas() {
        var pixelRatio;
        pixelRatio = Math.min(window.innerWidth / MIN_WIDTH, window.innerHeight / MIN_HEIGHT);
        canvas.width = Math.ceil(window.innerWidth / pixelRatio);
        canvas.height = Math.ceil(window.innerHeight / pixelRatio);
        console.log(pixelRatio, canvas.width, canvas.height);
        realCanvas.width = window.innerWidth;
        realCanvas.height = window.innerHeight;
        realCtx.mozImageSmoothingEnabled = false;
        realCtx.webkitImageSmoothingEnabled = false;
        realCtx.msImageSmoothingEnabled = false;
        realCtx.imageSmoothingEnabled = false;
        ctx.translate(0.5, 0.5);
    }
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.moveTo(10, 10);
        ctx.lineTo(10, 20);
        ctx.stroke();
        realCtx.clearRect(0, 0, realCanvas.width, realCanvas.height);
        realCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, realCanvas.width, realCanvas.height);
    }
    function playPause() {
        paused = !paused;
        if (!paused) {
            requestAnimationFrame(nextFrame);
        }
    }
    App.playPause = playPause;
    function nextFrame() {
        render();
        if (!paused) {
            window.requestAnimationFrame(nextFrame);
        }
    }
    App.nextFrame = nextFrame;
    // Initialize stuff
    realCanvas = document.getElementById('game');
    realCtx = realCanvas.getContext('2d');
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    // Resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    // Start
    resizeCanvas();
    nextFrame();
})(App || (App = {}));
