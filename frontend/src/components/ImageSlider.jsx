import React, { useState } from 'react';
import roomPlaceholderImg from '../assets/room_placeholder.png';

/**
 * ImageSlider — A premium, high-performance image slider for room cards
 * Handles single image displaying seamlessly, and provides a polished, interactive
 * carousel for multiple images with glassmorphic arrows and dot indicators.
 */
export default function ImageSlider({ hinhAnh, alt = "Room", height = "100%", style = {} }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // If hinhAnh is null, undefined, or empty, return the placeholder
  if (!hinhAnh) {
    return (
      <div style={{ width: '100%', height: height, ...style }}>
        <img
          src={roomPlaceholderImg}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }

  // Parse images. Support single string or multiple separated by '|||'
  const images = hinhAnh.includes('|||') ? hinhAnh.split('|||') : [hinhAnh];

  if (images.length === 1) {
    return (
      <div style={{ width: '100%', height: height, ...style }}>
        <img
          src={images[0]}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card clicks
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card clicks
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card clicks
    setActiveIndex(index);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        overflow: 'hidden',
        userSelect: 'none',
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Current Active Image */}
      <img
        src={images[activeIndex]}
        alt={`${alt} - ${activeIndex + 1}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Glassmorphic Arrows (visible on hover) */}
      <button
        type="button"
        onClick={handlePrev}
        style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          color: '#1e293b',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          opacity: isHovered ? 1 : 0,
          visibility: isHovered ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, transform 0.3s ease, background 0.2s',
          zIndex: 5,
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.8)';
          e.target.style.transform = 'translateY(-50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.25)';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        ⟨
      </button>

      <button
        type="button"
        onClick={handleNext}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          color: '#1e293b',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          opacity: isHovered ? 1 : 0,
          visibility: isHovered ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, transform 0.3s ease, background 0.2s',
          zIndex: 5,
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.8)';
          e.target.style.transform = 'translateY(-50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.25)';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        ⟩
      </button>

      {/* Pill Counter (e.g. 1 / 3) */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          color: '#f8fafc',
          fontSize: '10px',
          fontWeight: '700',
          padding: '3px 8px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
          zIndex: 4,
          letterSpacing: '0.5px',
        }}
      >
        {activeIndex + 1} / {images.length}
      </div>

      {/* Elegant Dots Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '5px',
          zIndex: 4,
          padding: '4px 8px',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.25)',
          backdropFilter: 'blur(2px)',
        }}
      >
        {images.map((_, idx) => (
          <span
            key={idx}
            onClick={(e) => handleDotClick(e, idx)}
            style={{
              width: idx === activeIndex ? '14px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: idx === activeIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
