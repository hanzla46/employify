import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function FancyButton({ text, onClick, disabled = false }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.95 }}
      className={`relative px-8 py-4 font-bold text-white transition-all duration-500 
        rounded-xl shadow-2xl 
        bg-gradient-to-br from-[#4a90e2] via-[#50c878] to-[#8a2be2] 
        background-size-200 background-position-0
        hover:background-position-100
        focus:outline-none 
        overflow-hidden 
        transform hover:scale-105  
        disabled:opacity-50 
        disabled:cursor-not-allowed 
        group`}
      style={{
        backgroundSize: '200% 100%',
        backgroundPosition: isHovered ? '100% 0' : '0 0',
        transition: 'background-position 0.5s ease-in-out, transform 0.3s'
      }}
    >
      {/* Glowing Particle Effect */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isHovered ? 0.5 : 0,
          scale: isHovered ? 1.2 : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 left-0 w-full h-full 
          bg-white bg-opacity-20 blur-2xl 
          animate-pulse 
          rounded-full 
          transform -translate-x-1/2 -translate-y-1/2"></div>
      </motion.div>

      {/* Holographic Overlay */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isHovered ? 0.3 : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 
          bg-gradient-to-tr from-white/30 via-white/10 to-transparent 
          mix-blend-overlay 
          rounded-xl"></div>
      </motion.div>

      {/* Button Content */}
      <span className="relative z-20 flex items-center justify-center gap-2 
        text-shadow-lg 
        transition-all duration-300 
        group-hover:tracking-wider">
        {text}
      </span>

      {/* Animated Border */}
      <motion.div 
        className="absolute inset-0 border-2 border-transparent rounded-xl pointer-events-none"
        animate={{
          borderColor: isHovered 
            ? 'rgba(255,255,255,0.5)' 
            : 'transparent',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}