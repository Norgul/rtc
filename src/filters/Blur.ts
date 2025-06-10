export class BlurFilter {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private maxRadius: number;
    private width: number;
    private height: number;
    private vertexBuffer: WebGLBuffer;
    private textureCoordBuffer: WebGLBuffer;
    private texture: WebGLTexture;
    private framebuffer: WebGLFramebuffer;
    private tempTexture: WebGLTexture;
    private canvas: HTMLCanvasElement;
    private outputCanvas: HTMLCanvasElement;
    private outputContext: CanvasRenderingContext2D;

    constructor(canvasContext: CanvasRenderingContext2D, width: number, height: number, maxRadius: number = 3) {
        this.width = width;
        this.height = height;
        this.maxRadius = maxRadius;

        // Create WebGL context
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl = this.canvas.getContext('webgl', {preserveDrawingBuffer: true})!;

        // Create output canvas
        this.outputCanvas = document.createElement('canvas');
        this.outputCanvas.width = width;
        this.outputCanvas.height = height;
        this.outputContext = this.outputCanvas.getContext('2d')!;

        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        // Create shader program
        this.program = this.createShaderProgram();

        // Create buffers
        this.vertexBuffer = this.createVertexBuffer();
        this.textureCoordBuffer = this.createTextureCoordBuffer();

        // Create textures
        this.texture = this.createTexture();
        this.tempTexture = this.createTexture();

        // Create framebuffer
        this.framebuffer = this.createFramebuffer(this.tempTexture);

        // Set up viewport
        this.gl.viewport(0, 0, width, height);
    }

    private compileShader(source: string, type: number): WebGLShader {
        const shader = this.gl.createShader(type)!;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(shader);
            throw new Error(`Shader compilation error: ${info}`);
        }

        return shader;
    }

    private createShaderProgram(): WebGLProgram {
        const vertexShader = this.compileShader(`
            attribute vec4 aVertexPosition;
            attribute vec2 aTextureCoord;
            varying highp vec2 vTextureCoord;
            void main(void) {
                gl_Position = aVertexPosition;
                vTextureCoord = aTextureCoord;
            }
        `, this.gl.VERTEX_SHADER);

        const fragmentShader = this.compileShader(`
            precision highp float;
            varying highp vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform vec2 uResolution;
            uniform float uRadius;
            uniform bool uHorizontal;

            void main(void) {
                vec2 texel = 1.0 / uResolution;
                vec4 color = vec4(0.0);
                float total = 0.0;
                
                // Use a constant loop range and scale the weight based on radius
                for(int i = -20; i <= 20; i++) {
                    float weight = exp(-float(i * i) / (2.0 * uRadius * uRadius));
                    vec2 offset = uHorizontal ? vec2(float(i) * texel.x, 0.0) : vec2(0.0, float(i) * texel.y);
                    color += texture2D(uSampler, vTextureCoord + offset) * weight;
                    total += weight;
                }
                
                gl_FragColor = color / total;
            }
        `, this.gl.FRAGMENT_SHADER);

        const program = this.gl.createProgram()!;
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const info = this.gl.getProgramInfoLog(program);
            throw new Error(`Program linking error: ${info}`);
        }

        // Clean up shaders after linking
        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);

        return program;
    }

    private createVertexBuffer(): WebGLBuffer {
        const buffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0,
        ]), this.gl.STATIC_DRAW);
        return buffer;
    }

    private createTextureCoordBuffer(): WebGLBuffer {
        const buffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            0.0, 1.0,  // Bottom left
            1.0, 1.0,  // Bottom right
            0.0, 0.0,  // Top left
            1.0, 0.0   // Top right
        ]), this.gl.STATIC_DRAW);
        return buffer;
    }

    private createTexture(): WebGLTexture {
        const texture = this.gl.createTexture()!;
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // Create an empty texture with the correct dimensions
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.width,
            this.height,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            new Uint8Array(this.width * this.height * 4)
        );

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        return texture;
    }

    private createFramebuffer(texture: WebGLTexture): WebGLFramebuffer {
        const framebuffer = this.gl.createFramebuffer()!;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0,
            this.gl.TEXTURE_2D,
            texture,
            0
        );

        if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
            throw new Error('Framebuffer is not complete');
        }

        return framebuffer;
    }

    public apply(intensity: number = 1): void {
        if (intensity <= 0) return;

        const radius = Math.floor(this.maxRadius * intensity);
        if (radius <= 0) return;

        // Use the shader program
        this.gl.useProgram(this.program);

        // Set up vertex attributes
        const vertexPositionLocation = this.gl.getAttribLocation(this.program, 'aVertexPosition');
        const textureCoordLocation = this.gl.getAttribLocation(this.program, 'aTextureCoord');

        if (vertexPositionLocation === -1 || textureCoordLocation === -1) {
            throw new Error('Failed to get attribute locations');
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.enableVertexAttribArray(vertexPositionLocation);
        this.gl.vertexAttribPointer(vertexPositionLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
        this.gl.enableVertexAttribArray(textureCoordLocation);
        this.gl.vertexAttribPointer(textureCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Set uniforms
        const resolutionLocation = this.gl.getUniformLocation(this.program, 'uResolution');
        const radiusLocation = this.gl.getUniformLocation(this.program, 'uRadius');
        const horizontalLocation = this.gl.getUniformLocation(this.program, 'uHorizontal');

        if (!resolutionLocation || !radiusLocation || !horizontalLocation) {
            throw new Error('Failed to get uniform locations');
        }

        this.gl.uniform2f(resolutionLocation, this.width, this.height);
        this.gl.uniform1f(radiusLocation, radius);

        // First pass: horizontal blur
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.uniform1i(horizontalLocation, 1);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        // Second pass: vertical blur
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.uniform1i(horizontalLocation, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        // Copy the result to the output canvas
        this.outputContext.clearRect(0, 0, this.width, this.height);
        this.outputContext.drawImage(this.canvas, 0, 0);
    }

    public updateSource(canvas: HTMLCanvasElement): void {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            canvas
        );
    }

    public getOutputCanvas(): HTMLCanvasElement {
        return this.outputCanvas;
    }

    public dispose(): void {
        if (!this.gl) {
            return;
        }

        this.gl.deleteTexture(this.texture);
        this.gl.deleteTexture(this.tempTexture);
        this.gl.deleteBuffer(this.vertexBuffer);
        this.gl.deleteBuffer(this.textureCoordBuffer);
        this.gl.deleteFramebuffer(this.framebuffer);
        this.gl.deleteProgram(this.program);
        this.canvas.width = 1;
        this.canvas.height = 1;
        this.outputCanvas.width = 1;
        this.outputCanvas.height = 1;
    }
}
