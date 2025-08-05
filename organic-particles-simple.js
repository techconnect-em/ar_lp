// Simplified Organic Particle System - Working Version

class OrganicParticleSystem {
    constructor(canvas, particleCount = 5000) {
        console.log('🎮 Creating OrganicParticleSystem...', { canvas, particleCount });
        
        this.canvas = canvas;
        this.particleCount = particleCount;
        
        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        
        // Animation properties
        this.time = 0;
        this.isRunning = false;
        
        try {
            this.init();
        } catch (error) {
            console.error('❌ Failed to initialize OrganicParticleSystem:', error);
            throw error;
        }
    }
    
    init() {
        console.log('🔧 Initializing organic particle system...');
        
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
            antialias: true
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        
        console.log('✅ Renderer created');
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
            size: 1.5,
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
        this.animate();
        console.log('✅ Animation started');
    }
    
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;
        
        if (this.particles) {
            // Organic rotation
            this.particles.rotation.x = Math.sin(this.time * 0.3) * 0.2;
            this.particles.rotation.y += 0.005;
            this.particles.rotation.z = Math.cos(this.time * 0.2) * 0.1;
            
            // Organic pulsing
            const scale = 1 + Math.sin(this.time) * 0.1;
            this.particles.scale.setScalar(scale);
            
            // Update particle positions for organic movement
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
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        console.log('🔄 Window resized');
    }
    
    destroy() {
        this.isRunning = false;
        
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

console.log('📦 Organic particles script loaded successfully');