/// <reference path="gl.ts"/>
var App;
(function (App) {
    var POINTS_X = 20;
    var POINTS_Y = 20;
    var Point = (function () {
        function Point() {
        }
        return Point;
    }());
    var Polygon = (function () {
        function Polygon() {
        }
        return Polygon;
    }());
    var canvas, gl, shaderProgram, positionLocation, colorLocation, projectionLocation, buffer, heights, pointsArray = new Float32Array(12), i, j;
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function update() {
        var scene, qPoints, i, j, i_offset, j_offset;
        scene = [];
        qPoints = [];
        for (i = 0; i < (POINTS_Y - 1); i++) {
            for (j = 0; j < (POINTS_X - 1); j++) {
                // Generate points for one quadrangle
                for (i_offset = 0; i_offset < 2; i_offset++) {
                    for (j_offset = 0; j_offset < 2; j_offset++) {
                        qPoints[i_offset * 2 + j_offset] = {
                            x: ((j + j_offset) / (POINTS_X - 1)) * 2 - 1,
                            y: ((i + i_offset) / (POINTS_Y - 1)) * 2 - 1,
                            z: heights[(i + i_offset) * POINTS_X + (j + j_offset)]
                        };
                    }
                }
                scene.push({
                    color: [0, 0, 255],
                    points: [qPoints[0], qPoints[1], qPoints[2]]
                });
                scene.push({
                    color: [0, 0, 255],
                    points: [qPoints[1], qPoints[2], qPoints[3]]
                });
            }
        }
        return scene;
    }
    function render(polygons) {
        var polygon, point, i, j;
        for (i = 0; i < polygons.length; i += 1) {
            polygon = polygons[i];
            for (j = 0; j < polygon.points.length; j += 1) {
                point = polygon.points[j];
                pointsArray[j * 3] = point.x;
                pointsArray[j * 3 + 1] = point.y;
                pointsArray[j * 3 + 2] = point.z;
            }
            gl.uniform4f(colorLocation, polygon.color[0], polygon.color[1], polygon.color[2], 1);
            gl.uniformMatrix4fv(projectionLocation, false, GL.perspectiveMatrix());
            gl.bufferData(gl.ARRAY_BUFFER, pointsArray, gl.STATIC_DRAW);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        }
    }
    function nextFrame() {
        var scene;
        scene = update();
        render(scene);
        window.requestAnimationFrame(nextFrame);
    }
    // Initialize stuff
    canvas = document.getElementById('game');
    gl = GL.initWebGL(canvas);
    shaderProgram = GL.initShaders(gl);
    positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
    colorLocation = gl.getUniformLocation(shaderProgram, 'u_color');
    projectionLocation = gl.getUniformLocation(shaderProgram, 'u_projection');
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    // Generate initial heights
    heights = [];
    for (i = 0; i < POINTS_X * POINTS_Y; i++) {
        heights[i] = Math.random() * 0.2;
    }
    // Resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    // Start
    resizeCanvas();
    nextFrame();
})(App || (App = {}));
