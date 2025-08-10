// Optimized Organic Particle System - Performance Enhanced

class OrganicParticleSystem {
    constructor(canvas, particleCount = null) {
        console.log('🎮 Creating OrganicParticleSystem...', { canvas, particleCount });
        
        this.canvas = canvas;
        this.particleCount = particleCount || this.getOptimalParticleCount();
        
        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        
        // Animation properties
        this.time = 0;
        this.isRunning = false;
        this.animationId = null;
        this.isVisible = true;
        
        // Performance optimization
        this.resizeTimeout = null;
        
        // WebGL support check
        if (!this.checkWebGLSupport()) {
            console.warn('⚠️ WebGL not supported, falling back to static background');
            this.enableStaticFallback();
            return;
        }
        
        try {
            this.init();
            this.setupVisibilityHandling();
        } catch (error) {
            console.error('❌ Failed to initialize OrganicParticleSystem:', error);
            this.enableStaticFallback();
        }
    }
    
    getOptimalParticleCount() {
        const width = window.innerWidth;
        if (width < 640) {
            return 2000;  // Mobile
        } else if (width <= 1024) {
            return 3500;  // Tablet
        } else {
            return 5000;  // Desktop
        }
    }
    
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (e) {
            return false;
        }
    }
    
    enableStaticFallback() {
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.style.display = 'none';
            this.canvas.parentElement.classList.add('hero-static-bg');
        }
        console.log('📷 Static background fallback enabled');
    }
    
    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.pauseAnimation();
            } else if (document.visibilityState === 'visible') {
                this.resumeAnimation();
            }
        });
    }
    
    pauseAnimation() {
        this.isVisible = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        console.log('⏸️ Animation paused (tab hidden)');
    }
    
    resumeAnimation() {
        this.isVisible = true;
        if (this.isRunning && !this.animationId) {
            this.animate();
        }
        console.log('▶️ Animation resumed (tab visible)');
    }
    
    init() {
        console.log(`🔧 Initializing organic particle system with ${this.particleCount} particles...`);
        
        // Check dependencies
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js is not available');
        }
        
        if (!this.canvas) {
            throw new Error('Canvas element is required');
        }
        
        // Setup Three.js
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.createParticles();
        this.startAnimation();
        
        console.log('✅ Organic particle system initialized successfully');
        return true;
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        console.log('✅ Scene created');
    }
    
    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 50;
        console.log('✅ Camera created');
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: false,  // Disable for performance
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // Limit pixel ratio for performance
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.setClearColor(0x000000, 0);
        
        console.log('✅ Renderer created with limited pixel ratio');
    }
    
    createParticles() {
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        
        // Create organic distribution
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // Organic sphere distribution
            const radius = Math.random() * 30 + 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Organic colors (blue to yellow)
            const colorMix = Math.random();
            colors[i3] = colorMix; // R
            colors[i3 + 1] = 0.5 + colorMix * 0.5; // G
            colors[i3 + 2] = 1.0 - colorMix * 0.5; // B
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // Create material
        const material = new THREE.PointsMaterial({
            size: window.innerWidth < 640 ? 1.0 : 1.5,  // Smaller particles on mobile
            sizeAttenuation: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8
        });
        
        // Create particle system
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        
        console.log(`✅ Created ${this.particleCount} organic particles`);
    }
    
    startAnimation() {
        this.isRunning = true;
        if (this.isVisible) {
            this.animate();
        }
        console.log('✅ Animation started');
    }
    
    animate() {
        if (!this.isRunning || !this.isVisible) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;
        
        if (this.particles) {
            // Organic rotation
            this.particles.rotation.x = Math.sin(this.time * 0.3) * 0.2;
            this.particles.rotation.y += 0.005;
            this.particles.rotation.z = Math.cos(this.time * 0.2) * 0.1;
            
            // Organic pulsing
            const scale = 1 + Math.sin(this.time) * 0.1;
            this.particles.scale.setScalar(scale);
            
            // Reduce particle position updates on mobile for performance
            if (window.innerWidth >= 640) {
                // Update particle positions for organic movement (desktop only)
                const positions = this.particles.geometry.attributes.position.array;
                for (let i = 0; i < this.particleCount; i++) {
                    const i3 = i * 3;
                    
                    // Add subtle organic noise
                    const noiseX = Math.sin(this.time + i * 0.01) * 0.5;
                    const noiseY = Math.cos(this.time + i * 0.02) * 0.5;
                    const noiseZ = Math.sin(this.time + i * 0.015) * 0.5;
                    
                    positions[i3] += noiseX * 0.1;
                    positions[i3 + 1] += noiseY * 0.1;
                    positions[i3 + 2] += noiseZ * 0.1;
                }
                
                this.particles.geometry.attributes.position.needsUpdate = true;
            }
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    onWindowResize() {
        // Debounce resize events
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
            if (!this.camera || !this.renderer) return;
            
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            
            console.log('🔄 Window resized (debounced)');
        }, 150);
    }
    
    destroy() {
        this.isRunning = false;
        this.isVisible = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = null;
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.scene) {
            this.scene.clear();
        }
        
        console.log('🗑️ Organic particle system destroyed');
    }
}

// Export to global scope
if (typeof window !== 'undefined') {
    window.OrganicParticleSystem = OrganicParticleSystem;
    console.log('✅ OrganicParticleSystem exported to window');
}

// Module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrganicParticleSystem;
}

console.log('📦 Optimized organic particles script loaded successfully');