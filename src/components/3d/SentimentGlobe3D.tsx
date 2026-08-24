'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SentimentGlobe3DProps {
  sentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score?: number; // 0 to 100
  className?: string;
}

export const SentimentGlobe3D: React.FC<SentimentGlobe3DProps> = ({
  sentiment = 'BULLISH',
  score = 78,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Color based on sentiment
    const primaryColor =
      sentiment === 'BULLISH'
        ? new THREE.Color(0x10b981) // Emerald
        : sentiment === 'BEARISH'
        ? new THREE.Color(0xf43f5e) // Rose
        : new THREE.Color(0x06b6d4); // Cyan

    const secondaryColor =
      sentiment === 'BULLISH'
        ? new THREE.Color(0x059669)
        : sentiment === 'BEARISH'
        ? new THREE.Color(0xe11d48)
        : new THREE.Color(0x38bdf8);

    // 1. Inner Glowing Wireframe Icosahedron
    const icoGeometry = new THREE.IcosahedronGeometry(60, 2);
    const icoMaterial = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
    scene.add(icoMesh);

    // 2. Outer Node Points on Vertices
    const pointsGeometry = new THREE.BufferGeometry();
    const icoPositions = icoGeometry.attributes.position.array;
    pointsGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(icoPositions), 3)
    );

    const pointsMaterial = new THREE.PointsMaterial({
      size: 4,
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(pointsMesh);

    // 3. Orbital Glowing Rings
    const ring1Geometry = new THREE.RingGeometry(75, 76.5, 64);
    const ring1Material = new THREE.MeshBasicMaterial({
      color: primaryColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ring2Geometry = new THREE.RingGeometry(85, 86, 64);
    const ring2Material = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = Math.PI / 6;
    scene.add(ring2);

    // 4. Central Pulsing Core
    const coreGeometry = new THREE.SphereGeometry(25, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // 5. Animation Loop
    let animationFrameId: number;
    let clock = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock += 0.02;

      icoMesh.rotation.y += 0.008;
      icoMesh.rotation.x += 0.004;

      pointsMesh.rotation.y += 0.008;
      pointsMesh.rotation.x += 0.004;

      ring1.rotation.z += 0.012;
      ring2.rotation.z -= 0.009;

      // Pulse core
      const scale = 1 + Math.sin(clock * 3) * 0.12;
      core.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      icoGeometry.dispose();
      icoMaterial.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      ring1Geometry.dispose();
      ring1Material.dispose();
      ring2Geometry.dispose();
      ring2Material.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      renderer.dispose();
    };
  }, [sentiment, score]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div ref={containerRef} className="w-full h-full min-h-[260px] min-w-[260px]" />
      
      {/* Central Holographic Stat Readout */}
      <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
        <span className="font-mono text-2xl font-black tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">
          {score}%
        </span>
        <span
          className={`font-mono text-xs font-bold uppercase tracking-wider ${
            sentiment === 'BULLISH'
              ? 'text-emerald-400'
              : sentiment === 'BEARISH'
              ? 'text-rose-400'
              : 'text-cyan-400'
          }`}
        >
          {sentiment}
        </span>
      </div>
    </div>
  );
};
