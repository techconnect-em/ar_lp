// Ambient Particle System for CTA and Contact sections
// Simpler version without text formation
class AmbientParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.particleCount = 3000; // Fewer particles for subtlety

        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;

        // Animation properties
        this.time = 0;
        this.isRunning = false;
        this.animationId = null;

        // WebGL support check
        if (!this.checkWebGLSupport()) {
            return;
        }

        try {
            this.init();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize AmbientParticleSystem:', error);
        }
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    init() {
        // Scene Setup
        this.scene = new THREE.Scene();

        // Camera Setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.canvas.offsetWidth / this.canvas.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.z = 50;

        // Renderer Setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: false,
            powerPreference: "low-power"
        });
        this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        // Create Particles
        this.createParticles();

        // Start Animation
        this.isRunning = true;
        this.animate();
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const scales = new Float32Array(this.particleCount);

        const colorPalette = [
            new THREE.Color('#4a90e2'), // Soft Blue
            new THREE.Color('#22d3ee'), // Cyan
            new THREE.Color('#ffffff'), // White
            new THREE.Color('#818cf8'), // Indigo
        ];

        for (let i = 0; i < this.particleCount; i++) {
            // Random positions in a wider area
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            scales[i] = Math.random() * 0.5 + 0.3;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

        // Simple shader material
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                uniform float uTime;
                uniform float uPixelRatio;
                
                attribute float scale;
                attribute vec3 color;
                
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    
                    // Gentle floating motion
                    float time = uTime * 0.3;
                    pos.x += sin(pos.y * 0.02 + time) * 1.5;
                    pos.y += cos(pos.x * 0.02 + time) * 1.5;
                    pos.z += sin(pos.x * 0.01 + time * 0.5) * 2.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // Smaller particles
                    gl_PointSize = (150.0 * scale * uPixelRatio) * (1.0 / -mvPosition.z);
                    
                    // Fade based on distance
                    vAlpha = smoothstep(100.0, 0.0, -mvPosition.z) * 0.4;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    float r = distance(gl_PointCoord, vec2(0.5));
                    if (r > 0.5) discard;
                    
                    float glow = 1.0 - (r * 2.0);
                    glow = pow(glow, 1.5);
                    
                    gl_FragColor = vec4(vColor, vAlpha * glow);
                }
            `,
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) }
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    setupEventListeners() {
        // Resize handler with throttling
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.onResize(), 150);
        });

        // Visibility handling
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.pauseAnimation();
            } else {
                this.resumeAnimation();
            }
        });
    }

    onResize() {
        if (!this.camera || !this.renderer || !this.canvas) return;

        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame(this.animate.bind(this));

        this.time += 0.01;

        // Update uniforms
        if (this.particles && this.particles.material) {
            this.particles.material.uniforms.uTime.value = this.time;

            // Very slow rotation
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.x = Math.sin(this.time * 0.1) * 0.05;
        }

        this.renderer.render(this.scene, this.camera);
    }

    pauseAnimation() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resumeAnimation() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }
}

// Initialize ambient particles
document.addEventListener('DOMContentLoaded', () => {
    // CTA section particles
    const ctaCanvas = document.getElementById('cta-canvas');
    if (ctaCanvas) {
        new AmbientParticleSystem(ctaCanvas);
    }

    // Contact section particles
    const contactCanvas = document.getElementById('contact-canvas');
    if (contactCanvas) {
        new AmbientParticleSystem(contactCanvas);
    }
});
