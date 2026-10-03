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
  particleCount = 1600,
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

    const isLightMode = document.documentElement.classList.contains('light');

    // Palettes: Calming soft tones in Light Mode, Electric Neon in Dark Mode
    const darkChoices = [
      new THREE.Color(0x06b6d4), // Cyan
      new THREE.Color(0x10b981), // Emerald
      new THREE.Color(0x8b5cf6), // Violet
      new THREE.Color(0x38bdf8), // Sky
      new THREE.Color(0xf59e0b), // Gold
    ];

    const lightChoices = [
      new THREE.Color(0x38bdf8), // Soft Sky
      new THREE.Color(0x34d399), // Soft Mint
      new THREE.Color(0x818cf8), // Soft Indigo
      new THREE.Color(0x94a3b8), // Soft Slate
      new THREE.Color(0xfbbf24), // Soft Amber
    ];

    const colorChoices = isLightMode ? lightChoices : darkChoices;

    const sep = 36;
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

        scales[i] = Math.random() * 2.5 + 1.5;

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

    // 3. Points Material - Low glare and soft opacity in Light Mode
    const material = new THREE.PointsMaterial({
      size: isLightMode ? 3.5 : 4.5,
      vertexColors: true,
      transparent: true,
      opacity: isLightMode ? 0.22 : 0.65,
      blending: isLightMode ? THREE.NormalBlending : THREE.AdditiveBlending,
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
      mouseX = (event.clientX - window.innerWidth / 2) * 0.35;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.35;
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

      // Smooth mouse parallax lerp
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      camera.position.x = targetX;
      camera.position.y = 200 - targetY * 0.5;
      camera.lookAt(scene.position);

      const positions = geometry.attributes.position.array as Float32Array;

      let idx = 0;
      for (let ix = 0; ix < numX; ix++) {
        for (let iz = 0; iz < numZ; iz++) {
          if (idx >= particleCount) break;
          // Dual harmonic sine wave calculation
          positions[idx * 3 + 1] =
            Math.sin((ix + count) * 0.3) * 40 + Math.sin((iz + count) * 0.5) * 40;
          idx++;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      count += 0.04;

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
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};
