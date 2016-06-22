namespace GL {
  export function initWebGL(canvas: HTMLCanvasElement) {
    let gl: WebGLRenderingContext = null;

    try {
      gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext;
    } catch(e) {}

    if (gl) {
      gl.clearColor(1.0, 1.0, 1.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    return gl;
  }

  export function perspectiveMatrix() {
    let
      matrices: number[][],
      result: number[],
      i: number;

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

    // Rotate -45 degrees around X axis
    matrices.push([
      1, 0, 0, 0,
      0, Math.cos(-Math.PI / 4), -Math.sin(-Math.PI / 4), 0,
      0, Math.sin(-Math.PI / 4), Math.cos(-Math.PI / 4), 0,
      0, 0, 0, 1
    ]);

    // Perspective
    // matrices.push([
    //   1, 0, 0, 0,
    //   0, 1, 0, 0,
    //   0, 0, 1, 1,
    //   0, 0, 0, 0
    // ]);

    for (i = 0; i < matrices.length; i++) {
      result = matmul(result, matrices[i], 4);
    }

    return new Float32Array(result);
  }

  function matmul(A: number[], B: number[], n: number): number[] {
    let
      C = new Array(n * n),
      i = 0, j = 0, k = 0;

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

  export function initShaders(gl: WebGLRenderingContext) {
    let
      fragmentShader = getShader(gl, 'shader-fs'),
      vertexShader   = getShader(gl, 'shader-vs'),
      shaderProgram: WebGLProgram;

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(
        'Unable to initialize the shader program: ' +
        gl.getProgramInfoLog(shaderProgram)
      );
    }

    gl.useProgram(shaderProgram);

    return shaderProgram;
  }

  function getShader(gl: WebGLRenderingContext, id: string) {
    let
      shaderScript: HTMLScriptElement,
      theSource: string,
      currentChild: Node,
      shader: WebGLShader;

    shaderScript = document.getElementById(id) as HTMLScriptElement;

    if (!shaderScript) {
      return null;
    }

    theSource = '';
    currentChild = shaderScript.firstChild;

    while(currentChild) {
      if (currentChild.nodeType === currentChild.TEXT_NODE) {
        theSource += currentChild.textContent;
      }

      currentChild = currentChild.nextSibling;
    }

    if (shaderScript.type === 'x-shader/x-fragment') {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === 'x-shader/x-vertex') {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, theSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(
        'An error occurred compiling the shaders: ' +
        gl.getShaderInfoLog(shader)
      );
      return null;
    }

    return shader;
  }
}
