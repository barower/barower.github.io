// Updated GLSL shader code
const fragmentShaderSource = `
    precision mediump float;

    #extension GL_OES_standard_derivatives : enable

    uniform vec2 u_resolution;
    uniform float u_time;

    mat2 m(float a) {
        float c = cos(a), s = sin(a);
        return mat2(c, -s, s, c);
    }

    float map(vec3 p) {
        p.xz *= m(u_time * 0.4);
        p.xy *= m(u_time * 0.1);
        vec3 q = p * 65.0 + u_time;
        return length(p + vec3(sin(u_time * 0.7))) * log(length(p) + 1.0) + sin(q.x + sin(q.z + sin(q.y))) * 0.5 - 1.0;
    }

    void main() {
        vec2 a = gl_FragCoord.xy / u_resolution.y - vec2(0.9, 0.5);
        vec3 cl = vec3(0.0);
        float d = 2.5;

        for (int i = 0; i <= 5; i++) {
            vec3 p = vec3(0, 0, 4.0) + normalize(vec3(a, -1.0)) * d;
            float rz = map(p);
            float f = clamp((rz - map(p + 0.1)) * 0.5, -0.1, 1.0);
            vec3 l = vec3(0.1, 0.3, 0.4) + vec3(5.0, 2.5, 3.0) * f;
            cl = cl * l + smoothstep(2.5, 0.0, rz) * 0.6 * l;
            d += min(rz, 1.0);
        }

        gl_FragColor = vec4(cl, 1.0);
    }
`;

// Rest of the code (init function, shader compilation, etc.) remains the same...
// Updated Vertex shader code to cover the entire canvas
const vertexShaderSource = `
    precision mediump float;

    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

// Initialize the WebGL context and compile shaders
function init() {
    const canvas = document.getElementById("shaderCanvas");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        console.error("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }

    // Set the canvas size to the window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Create program and link shaders
    const program = createProgram(gl, vertexShader, fragmentShader);

    // Use the program
    gl.useProgram(program);

    // Set up vertex data
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Get attribute location and enable it
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Set up uniforms
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    const timeUniformLocation = gl.getUniformLocation(program, "u_time");

    // Render loop
    function render() {
        // Set the canvas size to the window size in each frame
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
        gl.uniform1f(timeUniformLocation, performance.now() / 1000.0);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Update uniforms and draw
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
        gl.uniform1f(timeUniformLocation, performance.now() / 1000.0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(render);
    }

    // Start the render loop
    render();
}


// Helper function to create a shader
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Helper function to create a program and link shaders
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(`Program linking error: ${gl.getProgramInfoLog(program)}`);
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

// Run the initialization function
init();

