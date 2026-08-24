'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GoldCoin3DProps {
  className?: string;
  size?: number;
}

export const GoldCoin3D: React.FC<GoldCoin3DProps> = ({ className = '', size = 160 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Gold Cylinder / Coin Geometry
    const coinGeometry = new THREE.CylinderGeometry(42, 42, 8, 48);
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.25,
    });
    const coin = new THREE.Mesh(coinGeometry, goldMaterial);
    coin.rotation.x = Math.PI / 3;
    scene.add(coin);

    // Glowing rim
    const rimGeometry = new THREE.TorusGeometry(43, 1.2, 16, 64);
    const rimMaterial = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.7,
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    coin.add(rim);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffe066, 3);
    dirLight1.position.set(60, 100, 80);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.5);
    dirLight2.position.set(-60, -80, -40);
    scene.add(dirLight2);

    let animationFrameId: number;
    let clock = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock += 0.025;

      coin.rotation.y += 0.02;
      coin.position.y = Math.sin(clock) * 4;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coinGeometry.dispose();
      goldMaterial.dispose();
      rimGeometry.dispose();
      rimMaterial.dispose();
      renderer.dispose();
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center filter drop-shadow-[0_10px_25px_rgba(245,158,11,0.35)] ${className}`}
    />
  );
};
