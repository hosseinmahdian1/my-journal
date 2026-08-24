'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Scene3DBackgroundProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
}

export const Scene3DBackground: React.FC<Scene3DBackgroundProps> = ({
  className = '',
  particleCount = 1800,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    camera.position.z = 700;
    camera.position.y = 200;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Geometry & Custom Particle Wave
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    // Color palettes: Cyan (#06b6d4), Emerald (#10b981), Violet (#8b5cf6), Gold (#f59e0b)
    const colorChoices = [
      new THREE.Color(0x06b6d4), // Cyan
      new THREE.Color(0x10b981), // Emerald
      new THREE.Color(0x8b5cf6), // Violet
      new THREE.Color(0x38bdf8), // Sky
      new THREE.Color(0xf59e0b), // Gold
    ];

    const sep = 35;
    const numX = Math.floor(Math.sqrt(particleCount * 2));
    const numZ = Math.floor(particleCount / numX);

    let i = 0;
    for (let ix = 0; ix < numX; ix++) {
      for (let iz = 0; iz < numZ; iz++) {
        if (i >= particleCount) break;
        const x = ix * sep - (numX * sep) / 2;
        const z = iz * sep - (numZ * sep) / 2;
        const y = 0;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        scales[i] = Math.random() * 3 + 2;

        const col = colorChoices[Math.floor(Math.random() * colorChoices.length)];
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;

        i++;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 3. Shader Material for Glowing Circular Neon Particles
    const material = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 4. Mouse Tracking & Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return;
      mouseX = (event.clientX - window.innerWidth / 2) * 0.4;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 5. Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let count = 0;
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      count += 0.035;

      // Smooth mouse interpolation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = 220 - targetY * 0.5;
      camera.lookAt(new THREE.Vector3(0, 40, 0));

      const pos = geometry.attributes.position.array as Float32Array;

      let idx = 0;
      for (let ix = 0; ix < numX; ix++) {
        for (let iz = 0; iz < numZ; iz++) {
          if (idx >= particleCount) break;
          // Dual sine-wave fluid animation
          const yVal =
            Math.sin((ix + count) * 0.3) * 35 +
            Math.sin((iz + count) * 0.4) * 35 +
            Math.cos((ix + iz + count) * 0.2) * 15;

          pos[idx * 3 + 1] = yVal;
          idx++;
        }
      }
      geometry.attributes.position.needsUpdate = true;

      particles.rotation.y = count * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [particleCount, interactive]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80 dark:opacity-65 transition-opacity duration-700 ${className}`}
      aria-hidden="true"
    />
  );
};
