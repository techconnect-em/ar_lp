class OrganicParticleSystem {
    constructor(canvas, particleCount = null) {
        console.log('✨ Initializing Gemini-style Particle System...');

        this.canvas = canvas;
        // Increase particle count for the fluid effect, but keep it performant
        this.particleCount = particleCount || this.getOptimalParticleCount();

        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.material = null;
        this.geometry = null;
        this.particles = null;

        // Animation properties
        this.time = 0;
        this.isRunning = false;
        this.animationId = null;
        this.mouseX = 0;
        this.mouseY = 0;

        // WebGL support check
        if (!this.checkWebGLSupport()) {
            console.warn('⚠️ WebGL not supported, falling back to static background');
            this.enableStaticFallback();
            return;
        }

        try {
            this.init();
            this.setupEventListeners();
        } catch (error) {
            console.error('❌ Failed to initialize ParticleSystem:', error);
            this.enableStaticFallback();
        }
    }

    getOptimalParticleCount() {
        const width = window.innerWidth;
        if (width < 640) return 10000;     // Mobile
        if (width <= 1024) return 30000;   // Tablet
        return 60000;                      // Desktop (High density)
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
        // 1. Scene Setup
        this.scene = new THREE.Scene();

        // 2. Camera Setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50; // Moved back to see the field

        // 3. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 4. Generate Text Targets
        const textTargets = this.generateTextPositions("AR");

        // 5. Create Particles with Custom Shader
        this.createParticles(textTargets);

        // 6. Start Animation
        this.isRunning = true;
        this.animate();

        console.log(`✅ Particle System initialized with ${this.particleCount} particles`);
    }

    generateTextPositions(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Massive canvas to ensure no clipping and high resolution curves
        const width = 1024;
        const height = 1024;
        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Huge font size for smooth curves
        ctx.font = '900 500px "Inter", "Arial Black", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const targets = [];

        // Step 5 to ensure we don't exceed particle count too much
        const step = 5;

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                if (data[index] > 128) {
                    // Map 2D canvas to 3D world space
                    // Scale calculation:
                    // Canvas width 1024. Target 3D width ~60 units.
                    // 60 / 1024 = 0.058
                    const scale = 0.06;
                    const posX = (x - width / 2) * scale;
                    const posY = -(y - height / 2) * scale;

                    // Position at Z=0
                    targets.push(new THREE.Vector3(posX, posY, 0));
                }
            }
        }

        // Shuffle targets to prevent "bottom cut off" if we have more targets than particles
        // Fisher-Yates Shuffle
        for (let i = targets.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [targets[i], targets[j]] = [targets[j], targets[i]];
        }

        return targets;
    }

    animate() {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame(this.animate.bind(this));

        this.time += 0.01;

        // Morph Cycle Logic
        const cycle = this.time % 10.0;
        let targetMorph = 0;

        if (cycle > 4.0 && cycle < 9.0) {
            targetMorph = 1; // Form text
        } else {
            targetMorph = 0; // Chaos
        }

        // Smoothly interpolate current uMorph towards targetMorph
        const currentMorph = this.material.uniforms.uMorph.value;
        this.material.uniforms.uMorph.value += (targetMorph - currentMorph) * 0.02;

        // Update uniforms
        if (this.material) {
            this.material.uniforms.uTime.value = this.time;

            // Smooth mouse interpolation
            const currentMouse = this.material.uniforms.uMouse.value;
            currentMouse.x += (this.mouseX - currentMouse.x) * 0.05;
            currentMouse.y += (this.mouseY - currentMouse.y) * 0.05;
        }

        // Rotation Logic: Face front when text is formed
        if (this.particles) {
            const morph = this.material.uniforms.uMorph.value;

            if (morph < 0.2) {
                // Chaos mode: Continuous rotation
                this.particles.rotation.y += 0.002;
                // Keep rotation within 0-2PI range to avoid long spins
                this.particles.rotation.y = this.particles.rotation.y % (Math.PI * 2);
            } else {
                // Text mode: Rotate towards 0 (Front)
                // Find shortest path to 0
                let currentRot = this.particles.rotation.y;
                // Normalize to -PI...PI
                if (currentRot > Math.PI) currentRot -= Math.PI * 2;
                if (currentRot < -Math.PI) currentRot += Math.PI * 2;

                // Smoothly interpolate to 0
                this.particles.rotation.y = currentRot * 0.95;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    createParticles(textTargets) {
        this.geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(this.particleCount * 3);
        const targets = new Float32Array(this.particleCount * 3); // Target positions
        const scales = new Float32Array(this.particleCount);
        const randomness = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);

        const colorPalette = [
            new THREE.Color('#ffd700'), // Bright Gold
            new THREE.Color('#00ffff'), // Bright Cyan
            new THREE.Color('#ffffff'), // White
            new THREE.Color('#a78bfa'), // Bright Indigo
            new THREE.Color('#fbbf24')  // Amber
        ];

        for (let i = 0; i < this.particleCount; i++) {
            // 1. Random Start Position (Chaos)
            positions[i * 3] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

            // 2. Target Position (Order)
            // Assign a target from the text points. Loop if we have more particles than points.
            // If no targets (fallback), just use random pos.
            let targetPos;
            if (textTargets && textTargets.length > 0) {
                const targetIndex = i % textTargets.length;
                targetPos = textTargets[targetIndex];
            } else {
                targetPos = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            }

            // Minimal jitter for sharp text
            targets[i * 3] = targetPos.x + (Math.random() - 0.5) * 0.2;
            targets[i * 3 + 1] = targetPos.y + (Math.random() - 0.5) * 0.2;
            targets[i * 3 + 2] = targetPos.z + (Math.random() - 0.5) * 0.5;

            scales[i] = Math.random();

            randomness[i * 3] = Math.random();
            randomness[i * 3 + 1] = Math.random();
            randomness[i * 3 + 2] = Math.random();

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3));
        this.geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        this.geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Custom Shader Material
        this.material = new THREE.ShaderMaterial({
            vertexShader: `
                uniform float uTime;
                uniform float uPixelRatio;
                uniform vec2 uMouse;
                uniform float uMorph; // 0.0 = Chaos, 1.0 = Text

                attribute float aScale;
                attribute vec3 aRandomness;
                attribute vec3 color;
                attribute vec3 aTarget;

                varying vec3 vColor;
                varying float vAlpha;
                varying float vMorph;

                // Simplex noise function (simplified)
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    vec3 i  = floor(v + dot(v, C.yyy) );
                    vec3 x0 = v - i + dot(i, C.xxx) ;
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min( g.xyz, l.zxy );
                    vec3 i2 = max( g.xyz, l.zxy );
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    i = mod289(i);
                    vec4 p = permute( permute( permute(
                                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                    float n_ = 0.142857142857;
                    vec3  ns = n_ * D.wyz - D.xzx;
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_ );
                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    vec4 b0 = vec4( x.xy, y.xy );
                    vec4 b1 = vec4( x.zw, y.zw );
                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
                    vec3 p0 = vec3(a0.xy,h.x);
                    vec3 p1 = vec3(a0.zw,h.y);
                    vec3 p2 = vec3(a1.xy,h.z);
                    vec3 p3 = vec3(a1.zw,h.w);
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                                dot(p2,x2), dot(p3,x3) ) );
                }

                void main() {
                    vColor = color;
                    vMorph = uMorph;

                    // --- Chaos Position Logic ---
                    vec3 chaosPos = position;
                    float time = uTime * 0.2;
                    chaosPos.x += sin(chaosPos.y * 0.05 + time) * 2.0;
                    chaosPos.y += sin(chaosPos.x * 0.05 + time) * 2.0;
                    chaosPos.z += sin(chaosPos.x * 0.02 + time * 0.3) * 5.0;

                    // --- Target Position Logic ---
                    vec3 targetPos = aTarget;
                    // Reduced noise amplitude for sharper text
                    float noise = snoise(vec3(targetPos.x * 0.1, targetPos.y * 0.1, uTime * 0.5));
                    targetPos += vec3(noise * 0.1, noise * 0.1, noise * 0.2);

                    // --- Morphing ---
                    // Smooth interpolation
                    vec3 finalPos = mix(chaosPos, targetPos, smoothstep(0.0, 1.0, uMorph));

                    // Mouse Interaction
                    float dist = distance(finalPos.xy, uMouse * 50.0);
                    float influence = smoothstep(30.0, 0.0, dist);
                    // Repel slightly when formed, attract when chaos
                    float repel = mix(10.0, -5.0, uMorph);
                    finalPos.z += influence * repel;

                    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    // Size - Increased when text is formed for better coverage
                    float sizeMultiplier = mix(400.0, 500.0, uMorph);
                    gl_PointSize = (sizeMultiplier * aScale * uPixelRatio) * (1.0 / -mvPosition.z);

                    // Alpha
                    vAlpha = smoothstep(80.0, 0.0, -mvPosition.z);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                varying float vMorph;

                void main() {
                    float r = distance(gl_PointCoord, vec2(0.5));
                    if (r > 0.5) discard;
                    
                    // Enhanced glow effect - softer falloff for brighter appearance
                    float glow = 1.0 - (r * 2.0);
                    glow = pow(glow, 0.8);
                    
                    // Strong brightness boost when formed (text mode)
                    float brightnessBoost = mix(1.0, 2.5, vMorph);
                    vec3 finalColor = vColor * brightnessBoost;
                    
                    gl_FragColor = vec4(finalColor, vAlpha * glow);
                }
            `,
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uMorph: { value: 0 }
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particles);
    }

    setupEventListeners() {
        // Resize handler
        window.addEventListener('resize', this.onResize.bind(this));

        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            // Normalize mouse position to -1 to 1
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
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
        if (!this.camera || !this.renderer) return;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
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

    enableStaticFallback() {
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.style.display = 'none';
            this.canvas.parentElement.classList.add('hero-static-bg');
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Hero section particles (with text formation)
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
        new OrganicParticleSystem(heroCanvas);
    }
});