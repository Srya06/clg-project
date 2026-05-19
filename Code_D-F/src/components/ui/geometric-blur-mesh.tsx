"use client";

import React, { useRef, useEffect } from "react";

const fragmentShader = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_time;
uniform int u_shape;
uniform int u_targetShape;
uniform float u_morphProgress;

#define PI 3.1415926535897932384626433832795
#define TWO_PI 6.2831853071795864769252867665590

// 3D rotation matrices
mat3 rotateX(float angle) {
    float s = sin(angle); float c = cos(angle);
    return mat3(1, 0, 0, 0, c, -s, 0, s, c);
}
mat3 rotateY(float angle) {
    float s = sin(angle); float c = cos(angle);
    return mat3(c, 0, s, 0, 1, 0, -s, 0, c);
}
mat3 rotateZ(float angle) {
    float s = sin(angle); float c = cos(angle);
    return mat3(c, -s, 0, s, c, 0, 0, 0, 1);
}

// Coordinate normalization
vec2 coord(in vec2 p) {
    p = p / u_resolution.xy;
    if (u_resolution.x > u_resolution.y) {
        p.x *= u_resolution.x / u_resolution.y;
        p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
    } else {
        p.y *= u_resolution.y / u_resolution.x;
        p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
    }
    p -= 0.5;
    return p;
}

// Project 3D point to 2D
vec2 project(vec3 p) {
    float perspective = 2.0 / (2.0 - p.z);
    return p.xy * perspective;
}

// Distance from point to line segment
float distToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a; vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

// Draw a line with blur effect
float drawLine(vec2 p, vec2 a, vec2 b, float thickness, float blur) {
    float d = distToSegment(p, a, b);
    return smoothstep(thickness + blur, thickness - blur, d);
}

// Get vertices for various shapes
void getCubeVertices(out vec3 v[8]) {
    float s = 0.7;
    v[0] = vec3(-s, -s, -s); v[1] = vec3( s, -s, -s); v[2] = vec3( s,  s, -s); v[3] = vec3(-s,  s, -s);
    v[4] = vec3(-s, -s,  s); v[5] = vec3( s, -s,  s); v[6] = vec3( s,  s,  s); v[7] = vec3(-s,  s,  s);
}
void getTetrahedronVertices(out vec3 v[4]) {
    float a = 1.0 / sqrt(3.0);
    v[0] = vec3( a,  a,  a); v[1] = vec3( a, -a, -a); v[2] = vec3(-a,  a, -a); v[3] = vec3(-a, -a,  a);
}
void getOctahedronVertices(out vec3 v[6]) {
    v[0] = vec3( 1, 0, 0); v[1] = vec3(-1, 0, 0); v[2] = vec3( 0, 1, 0);
    v[3] = vec3( 0,-1, 0); v[4] = vec3( 0, 0, 1); v[5] = vec3( 0, 0,-1);
}
void getIcosahedronVertices(out vec3 v[12]) {
    float t = (1.0 + sqrt(5.0)) / 2.0;
    float s = 1.0 / sqrt(1.0 + t * t);
    v[0] = vec3(-s, t*s, 0); v[1] = vec3( s, t*s, 0); v[2] = vec3(-s,-t*s, 0); v[3] = vec3( s,-t*s, 0);
    v[4] = vec3(0,-s, t*s); v[5] = vec3(0, s, t*s); v[6] = vec3(0,-s,-t*s); v[7] = vec3(0, s,-t*s);
    v[8] = vec3( t*s, 0,-s); v[9] = vec3( t*s, 0, s); v[10] = vec3(-t*s, 0,-s); v[11] = vec3(-t*s, 0, s);
}

// Draw wireframe shape
float drawWireframe(vec2 p, int shape, mat3 rotation, float scale, float thickness, float blur) {
    float res = 0.0;
    if (shape == 0) { // Cube - 12 edges
        vec3 v[8]; getCubeVertices(v);
        for (int i=0; i<8; i++) v[i] = rotation * (v[i] * scale);
        res += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[2]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[0]), thickness, blur);
        res += drawLine(p, project(v[4]), project(v[5]), thickness, blur);
        res += drawLine(p, project(v[5]), project(v[6]), thickness, blur);
        res += drawLine(p, project(v[6]), project(v[7]), thickness, blur);
        res += drawLine(p, project(v[7]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[0]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[5]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[6]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[7]), thickness, blur);
    } else if (shape == 1) { // Tetrahedron - 6 edges
        vec3 v[4]; getTetrahedronVertices(v);
        for (int i=0; i<4; i++) v[i] = rotation * (v[i] * scale);
        res += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        res += drawLine(p, project(v[0]), project(v[2]), thickness, blur);
        res += drawLine(p, project(v[0]), project(v[3]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[2]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[3]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
    } else if (shape == 2) { // Octahedron - 12 edges
        vec3 v[6]; getOctahedronVertices(v);
        for (int i=0; i<6; i++) v[i] = rotation * (v[i] * scale);
        res += drawLine(p, project(v[2]), project(v[0]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[1]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[5]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[0]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[1]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[5]), thickness, blur);
        res += drawLine(p, project(v[0]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[4]), project(v[1]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[5]), thickness, blur);
        res += drawLine(p, project(v[5]), project(v[0]), thickness, blur);
    } else if (shape == 3) { // Icosahedron - 30 edges
        vec3 v[12]; getIcosahedronVertices(v);
        for (int i=0; i<12; i++) v[i] = rotation * (v[i] * scale);
        res += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        res += drawLine(p, project(v[0]), project(v[5]), thickness, blur);
        res += drawLine(p, project(v[0]), project(v[7]), thickness, blur);
        res += drawLine(p, project(v[0]), project(v[10]), thickness, blur);
        res += drawLine(p, project(v[0]), project(v[11]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[5]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[7]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[8]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[9]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[6]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[10]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[11]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[6]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[8]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[9]), thickness, blur);
        res += drawLine(p, project(v[4]), project(v[5]), thickness, blur);
        res += drawLine(p, project(v[4]), project(v[9]), thickness, blur);
        res += drawLine(p, project(v[4]), project(v[11]), thickness, blur);
        res += drawLine(p, project(v[5]), project(v[9]), thickness, blur);
        res += drawLine(p, project(v[5]), project(v[11]), thickness, blur);
        res += drawLine(p, project(v[6]), project(v[8]), thickness, blur);
        res += drawLine(p, project(v[6]), project(v[10]), thickness, blur);
        res += drawLine(p, project(v[7]), project(v[8]), thickness, blur);
        res += drawLine(p, project(v[7]), project(v[10]), thickness, blur);
        res += drawLine(p, project(v[8]), project(v[9]), thickness, blur);
        res += drawLine(p, project(v[9]), project(v[11]), thickness, blur);
        res += drawLine(p, project(v[10]), project(v[11]), thickness, blur);
    } else if (shape == 4) { // Pyramid - 8 edges
        vec3 v[5]; float s = 0.7; v[0]=vec3(-s,0,-s); v[1]=vec3(s,0,-s); v[2]=vec3(s,0,s); v[3]=vec3(-s,0,s); v[4]=vec3(0,1,0);
        for (int i=0; i<5; i++) v[i] = rotation * (v[i] * scale);
        res += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[2]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[0]), thickness, blur);
        res += drawLine(p, project(v[0]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[4]), thickness, blur);
    } else if (shape == 5) { // Diamond - 12 edges
        vec3 v[6]; float s = 0.6; v[0]=vec3(-s,0,-s); v[1]=vec3(s,0,-s); v[2]=vec3(s,0,s); v[3]=vec3(-s,0,s); v[4]=vec3(0,1,0); v[5]=vec3(0,-1,0);
        for (int i=0; i<6; i++) v[i] = rotation * (v[i] * scale);
        res += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[2]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[0]), thickness, blur);
        res += drawLine(p, project(v[0]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[4]), thickness, blur);
        res += drawLine(p, project(v[0]), project(v[5]), thickness, blur);
        res += drawLine(p, project(v[1]), project(v[5]), thickness, blur);
        res += drawLine(p, project(v[2]), project(v[5]), thickness, blur);
        res += drawLine(p, project(v[3]), project(v[5]), thickness, blur);
    } else { // Hexagonal Prism - 18 edges
        vec3 v[12]; float angleStep = TWO_PI / 6.0;
        for (int i=0; i<6; i++) {
            v[i] = vec3(cos(float(i)*angleStep), -1, sin(float(i)*angleStep));
            v[i+6] = vec3(cos(float(i)*angleStep), 1, sin(float(i)*angleStep));
        }
        for (int i=0; i<12; i++) v[i] = rotation * (v[i] * scale);
        for (int i=0; i<6; i++) {
            res += drawLine(p, project(v[i]), project(v[int(mod(float(i+1), 6.0))]), thickness, blur);
            res += drawLine(p, project(v[i+6]), project(v[int(mod(float(i+1), 6.0))+6]), thickness, blur);
            res += drawLine(p, project(v[i]), project(v[i+6]), thickness, blur);
        }
    }
    return clamp(res, 0.0, 1.0);
}

vec3 render(vec2 st, vec2 mouse) {
    float mouseDistance = length(st - mouse);
    float mouseInfluence = 1.0 - smoothstep(0.0, 0.5, mouseDistance);
    float time = u_time * 0.2;
    mat3 rotation = rotateY(time + (mouse.x - 0.5) * mouseInfluence * 1.5) * 
                    rotateX(time * 0.7 + (mouse.y - 0.5) * mouseInfluence * 1.5) * 
                    rotateZ(time * 0.1);
    float scale = 0.35;
    float blur = mix(0.0001, 0.05, mouseInfluence);
    float thickness = mix(0.002, 0.003, mouseInfluence);
    float shapeA = drawWireframe(st, u_shape, rotation, scale, thickness, blur);
    float shapeB = drawWireframe(st, u_targetShape, rotation, scale, thickness, blur);
    float shape = mix(shapeA, shapeB, smoothstep(0.0, 1.0, u_morphProgress));
    vec3 color = vec3(0.9, 0.95, 1.0) * shape * (1.0 - mouseInfluence * 0.3);
    return pow(color * (1.1 - length(st)*0.3), vec3(0.9));
}

void main() {
    vec2 st = coord(gl_FragCoord.xy);
    vec2 mouse = coord(u_mouse * u_pixelRatio) * vec2(1., -1.);
    gl_FragColor = vec4(render(st, mouse), 1.0);
}
`;

const vertexShader = `
attribute vec3 a_position;
void main() {
    gl_Position = vec4(a_position, 1.0);
}
`;

const shapes = ["Cube", "Tetrahedron", "Octahedron", "Icosahedron", "Pyramid", "Diamond", "Hexagonal Prism"];

interface GeometricBlurMeshProps {
    onHoverTrigger?: () => void;
}

export default function GeometricBlurMesh({ onHoverTrigger }: GeometricBlurMeshProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const mouseDampRef = useRef({ x: 0, y: 0 });
    const stateRef = useRef({
        currentShape: 0, targetShape: 0, morphProgress: 0,
        isMorphing: false, lastHovered: 0, hasTriggeredCallback: false
    });

    const glRef = useRef<WebGLRenderingContext | null>(null);
    const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
    const startTimeRef = useRef(Date.now());
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const gl = canvasRef.current?.getContext('webgl', { antialias: true, alpha: false });
        if (!gl) return;
        glRef.current = gl;

        const program = gl.createProgram()!;
        const create = (type: number, src: string) => {
            const s = gl.createShader(type)!;
            gl.shaderSource(s, src); gl.compileShader(s);
            gl.attachShader(program, s);
        };
        create(gl.VERTEX_SHADER, vertexShader);
        create(gl.FRAGMENT_SHADER, fragmentShader);
        gl.linkProgram(program); gl.useProgram(program);

        uniformsRef.current = {
            u_mouse: gl.getUniformLocation(program, 'u_mouse'),
            u_resolution: gl.getUniformLocation(program, 'u_resolution'),
            u_pixelRatio: gl.getUniformLocation(program, 'u_pixelRatio'),
            u_time: gl.getUniformLocation(program, 'u_time'),
            u_shape: gl.getUniformLocation(program, 'u_shape'),
            u_targetShape: gl.getUniformLocation(program, 'u_targetShape'),
            u_morphProgress: gl.getUniformLocation(program, 'u_morphProgress')
        };

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,0, 1,-1,0, -1,1,0, 1,1,0]), gl.STATIC_DRAW);
        const pos = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);

        return () => { gl.deleteProgram(program); };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;
            const dpr = Math.min(window.devicePixelRatio, 2);
            canvas.width = container.clientWidth * dpr;
            canvas.height = container.clientHeight * dpr;
            canvas.style.width = container.clientWidth + "px";
            canvas.style.height = container.clientHeight + "px";
            if (glRef.current) glRef.current.viewport(0, 0, canvas.width, canvas.height);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        let lastTime = performance.now();
        const animate = (time: number) => {
            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;
            const gl = glRef.current;
            const state = stateRef.current;
            if (!gl || !canvasRef.current) { animationFrameRef.current = requestAnimationFrame(animate); return; }

            mouseDampRef.current.x += (mouseRef.current.x - mouseDampRef.current.x) * 8 * deltaTime;
            mouseDampRef.current.y += (mouseRef.current.y - mouseDampRef.current.y) * 8 * deltaTime;

            const dpr = window.devicePixelRatio || 1;
            const nX = (mouseDampRef.current.x / (canvasRef.current.width / dpr)) - 0.5;
            const nY = (mouseDampRef.current.y / (canvasRef.current.height / dpr)) - 0.5;
            const dist = Math.sqrt(nX * nX + nY * nY);

            if (dist < 0.25 && !state.isMorphing && (Date.now() - state.lastHovered > 4000)) {
                state.isMorphing = true;
                state.lastHovered = Date.now();
                let next; do { next = Math.floor(Math.random() * shapes.length); } while (next === state.currentShape);
                state.targetShape = next;
                if (!state.hasTriggeredCallback && onHoverTrigger) {
                    onHoverTrigger();
                    state.hasTriggeredCallback = true;
                }
            }

            if (state.isMorphing) {
                state.morphProgress += deltaTime * 0.35;
                if (state.morphProgress >= 1) {
                    state.currentShape = state.targetShape;
                    state.morphProgress = 0;
                    state.isMorphing = false;
                }
            }

            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform2f(uniformsRef.current.u_mouse, mouseDampRef.current.x, mouseDampRef.current.y);
            gl.uniform2f(uniformsRef.current.u_resolution, canvasRef.current.width, canvasRef.current.height);
            gl.uniform1f(uniformsRef.current.u_pixelRatio, Math.min(window.devicePixelRatio, 2));
            gl.uniform1f(uniformsRef.current.u_time, (Date.now() - startTimeRef.current) / 1000);
            gl.uniform1i(uniformsRef.current.u_shape, state.currentShape);
            gl.uniform1i(uniformsRef.current.u_targetShape, state.targetShape);
            gl.uniform1f(uniformsRef.current.u_morphProgress, state.morphProgress);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animationFrameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameRef.current!);
    }, [onHoverTrigger]);

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
}

export const Component = GeometricBlurMesh;
