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
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
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
