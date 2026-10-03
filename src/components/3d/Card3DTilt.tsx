'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glareEffect?: boolean;
  glowColor?: 'cyan' | 'emerald' | 'gold' | 'purple' | 'rose' | 'green' | 'red';
  onClick?: () => void;
}

export const Card3DTilt: React.FC<Card3DTiltProps> = ({
  children,
  className = '',
  intensity = 15,
  glareEffect = true,
  glowColor = 'gold',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs
  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-intensity, intensity]);

  // Dynamic glare coordinates
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const glowShadows = {
    cyan: 'hover:shadow-[0_20px_45px_-10px_rgba(34,211,238,0.25)] hover:border-[#22D3EE]/40',
    emerald: 'hover:shadow-[0_20px_45px_-10px_rgba(52,211,153,0.25)] hover:border-[#34D399]/40',
    green: 'hover:shadow-[0_20px_45px_-10px_rgba(52,211,153,0.25)] hover:border-[#34D399]/40',
    gold: 'hover:shadow-[0_20px_45px_-10px_rgba(139, 92, 246,0.25)] hover:border-[#8B5CF6]/40',
    purple: 'hover:shadow-[0_20px_45px_-10px_rgba(42, 42, 42,0.25)] hover:border-[#2A2A2A]/40',
    rose: 'hover:shadow-[0_20px_45px_-10px_rgba(248,113,113,0.25)] hover:border-[#F87171]/40',
    red: 'hover:shadow-[0_20px_45px_-10px_rgba(248,113,113,0.25)] hover:border-[#F87171]/40',
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.025, z: 20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`relative rounded-2xl transition-colors duration-300 ${glowShadows[glowColor]} ${className}`}
    >
      <div style={{ transform: 'translateZ(30px)' }} className="relative z-10 h-full w-full">
        {children}
      </div>

      {/* Dynamic Specular Glare Layer */}
      {glareEffect && isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-40 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.18) 0%, transparent 65%)`,
          }}
        />
      )}

      {/* 3D Border Bevel */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10 dark:border-white/5" />
    </motion.div>
  );
};
