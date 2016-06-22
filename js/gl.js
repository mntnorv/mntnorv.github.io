var GL;
(function (GL) {
    function initWebGL(canvas) {
        var gl = null;
        try {
            gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        }
        catch (e) { }
        if (gl) {
            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }
        return gl;
    }
    GL.initWebGL = initWebGL;
    function perspectiveMatrix(width, height) {
        var matrices, result, i, xScale, yScale;
        result = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
        matrices = [];
        // Rotate 45 degrees around Z axis
        matrices.push([
            Math.cos(Math.PI / 4), -Math.sin(Math.PI / 4), 0, 0,
            Math.sin(Math.PI / 4), Math.cos(Math.PI / 4), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        // Rotate -90 degrees around X axis
        matrices.push([
            1, 0, 0, 0,
            0, Math.cos(Math.PI / 4), -Math.sin(Math.PI / 4), 0,
            0, Math.sin(Math.PI / 4), Math.cos(Math.PI / 4), 0,
            0, 0, 0, 1
        ]);
        // Scale Y to show 1:1 grid
        xScale = width > height ? 1 : height / width;
        yScale = height > width ? 1 : width / height;
        matrices.push([
            xScale, 0, 0, 0,
            0, yScale, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 1
        ]);
        for (i = 0; i < matrices.length; i++) {
            result = matmul(result, matrices[i], 4);
        }
        return new Float32Array(result);
    }
    GL.perspectiveMatrix = perspectiveMatrix;
    function matmul(A, B, n) {
        var C = new Array(n * n), i = 0, j = 0, k = 0;
        for (i = 0; i < n; i++) {
            for (j = 0; j < n; j++) {
                var total = 0;
                for (k = 0; k < n; k++) {
                    total += A[i * n + k] * B[k * n + j];
                }
                C[i * n + j] = total;
            }
        }
        return C;
    }
    function initShaders(gl) {
        var fragmentShader = getShader(gl, 'shader-fs'), vertexShader = getShader(gl, 'shader-vs'), shaderProgram;
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' +
                gl.getProgramInfoLog(shaderProgram));
        }
        gl.useProgram(shaderProgram);
        return shaderProgram;
    }
    GL.initShaders = initShaders;
    function getShader(gl, id) {
        var shaderScript, theSource, currentChild, shader;
        shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }
        theSource = '';
        currentChild = shaderScript.firstChild;
        while (currentChild) {
            if (currentChild.nodeType === currentChild.TEXT_NODE) {
                theSource += currentChild.textContent;
            }
            currentChild = currentChild.nextSibling;
        }
        if (shaderScript.type === 'x-shader/x-fragment') {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        else if (shaderScript.type === 'x-shader/x-vertex') {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else {
            return null;
        }
        gl.shaderSource(shader, theSource);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' +
                gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
})(GL || (GL = {}));
