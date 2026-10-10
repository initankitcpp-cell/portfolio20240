import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.getElementById('heroScene');
const hero = document.getElementById('hero');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (canvas && hero) {
    try {
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: window.devicePixelRatio < 2,
            powerPreference: 'low-power'
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        renderer.setSize(hero.clientWidth, hero.clientHeight, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, hero.clientWidth / hero.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 8.5);

        const rig = new THREE.Group();
        rig.position.set(2.7, 0.15, 0);
        scene.add(rig);

        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x4ee8df,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.65, 2), coreMaterial);
        rig.add(core);

        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0x7887ff,
            wireframe: true,
            transparent: true,
            opacity: 0.08
        });
        const innerCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 1), innerMaterial);
        rig.add(innerCore);

        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x6f80ff,
            wireframe: true,
            transparent: true,
            opacity: 0.13
        });
        const rings = [
            [2.15, 0.012, 0, 0.35, 0],
            [2.55, 0.009, Math.PI / 2.5, 0, 0.35],
            [3.05, 0.006, Math.PI / 2, 0.7, 0]
        ].map(([radius, tube, x, y, z]) => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 120), ringMaterial);
            ring.rotation.set(x, y, z);
            rig.add(ring);
            return ring;
        });

        const particleCount = window.innerWidth < 700 ? 90 : 170;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i += 1) {
            const radius = 3.1 + Math.random() * 3.8;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.72;
            positions[i * 3 + 2] = radius * Math.cos(phi);
        }
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x7cefe5,
            size: 0.025,
            transparent: true,
            opacity: 0.42,
            sizeAttenuation: true
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        const linePositions = [];
        for (let i = 0; i < 42; i += 1) {
            const a = i * 3;
            const b = ((i * 7 + 13) % particleCount) * 3;
            linePositions.push(
                positions[a], positions[a + 1], positions[a + 2],
                positions[b], positions[b + 1], positions[b + 2]
            );
        }
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lines = new THREE.LineSegments(
            lineGeometry,
            new THREE.LineBasicMaterial({ color: 0x5d73ff, transparent: true, opacity: 0.07 })
        );
        scene.add(lines);

        let pointerX = 0;
        let pointerY = 0;
        let visible = true;
        let frameId = 0;
        const clock = new THREE.Clock();

        function applyTheme() {
            const light = document.documentElement.dataset.theme === 'light';
            coreMaterial.color.setHex(light ? 0x078c83 : 0x4ee8df);
            innerMaterial.color.setHex(light ? 0x4652bc : 0x7887ff);
            ringMaterial.color.setHex(light ? 0x5360d4 : 0x6f80ff);
            particleMaterial.color.setHex(light ? 0x159a92 : 0x7cefe5);
            coreMaterial.opacity = light ? 0.13 : 0.2;
            particleMaterial.opacity = light ? 0.24 : 0.42;
        }

        function render() {
            const elapsed = clock.getElapsedTime();
            if (!reduceMotion.matches) {
                core.rotation.x = elapsed * 0.055;
                core.rotation.y = elapsed * 0.09;
                innerCore.rotation.x = -elapsed * 0.075;
                innerCore.rotation.z = elapsed * 0.065;
                rings[0].rotation.z = elapsed * 0.045;
                rings[1].rotation.y = elapsed * 0.035;
                rings[2].rotation.x = Math.PI / 2 + elapsed * 0.025;
                particles.rotation.y = elapsed * 0.006;
                lines.rotation.y = elapsed * 0.006;
                rig.rotation.y += (pointerX * 0.16 - rig.rotation.y) * 0.035;
                rig.rotation.x += (-pointerY * 0.1 - rig.rotation.x) * 0.035;
            }
            renderer.render(scene, camera);
            frameId = visible && !reduceMotion.matches ? requestAnimationFrame(render) : 0;
        }

        function start() {
            if (!frameId && visible && !document.hidden) {
                clock.getDelta();
                frameId = requestAnimationFrame(render);
            }
        }

        function stop() {
            if (frameId) cancelAnimationFrame(frameId);
            frameId = 0;
        }

        function resize() {
            const width = hero.clientWidth;
            const height = hero.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
            renderer.setSize(width, height, false);
            renderer.render(scene, camera);
        }

        hero.addEventListener('pointermove', event => {
            const rect = hero.getBoundingClientRect();
            pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        }, { passive: true });
        hero.addEventListener('pointerleave', () => {
            pointerX = 0;
            pointerY = 0;
        });
        window.addEventListener('resize', resize, { passive: true });

        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) start();
            else stop();
        }, { threshold: 0.02 }).observe(hero);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stop();
            else start();
        });
        reduceMotion.addEventListener('change', () => {
            stop();
            render();
            start();
        });
        new MutationObserver(() => {
            applyTheme();
            renderer.render(scene, camera);
        }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        applyTheme();
        resize();
        render();
        document.documentElement.classList.add('webgl-ready');
    } catch (error) {
        document.documentElement.classList.add('webgl-fallback');
        console.info('Using the CSS hero fallback.', error);
    }
}
