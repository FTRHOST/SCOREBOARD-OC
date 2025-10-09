
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDatabase } from '@/firebase';
import { ref, update } from 'firebase/database';
import { cn } from '@/lib/utils';

interface DraggableElementProps {
  elementKey: string;
  style: { x: number; y: number; width: number; height: number; fontSize?: number, visible: boolean };
  children: React.ReactNode;
  selectedElement: string | null;
  layoutType: 'futsal' | 'volleyball';
}

const DraggableElement: React.FC<DraggableElementProps> = ({
  elementKey,
  style,
  children,
  selectedElement,
  layoutType,
}) => {
  const database = useDatabase();
  const isSelected = selectedElement === elementKey;
  const isVisible = style.visible !== false;

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: style.x, y: style.y });
  const offsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update position from style props if not dragging
    if (!isDragging) {
      setPosition({ x: style.x, y: style.y });
    }
  }, [style.x, style.y, isDragging]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelected || !database) return;

    // Prevent drag from starting on text selection
    e.preventDefault();
    setIsDragging(true);

    const parentRect = containerRef.current?.offsetParent?.getBoundingClientRect();
    const scale = parentRect ? (parentRect.width / (containerRef.current?.offsetParent?.clientWidth || 1)) : 1;
    
    offsetRef.current = {
      x: (e.clientX - parentRect!.left) / scale - position.x,
      y: (e.clientY - parentRect!.top) / scale - position.y,
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const parentRect = containerRef.current?.offsetParent?.getBoundingClientRect();
    if (!parentRect) return;
    const scale = parentRect ? (parentRect.width / (containerRef.current?.offsetParent?.clientWidth || 1)) : 1;
    
    const newX = (e.clientX - parentRect.left) / scale - offsetRef.current.x;
    const newY = (e.clientY - parentRect.top) / scale - offsetRef.current.y;
    setPosition({ x: newX, y: newY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    const path = `${layoutType === 'futsal' ? 'scoreboard' : 'volleyball'}/layout/${elementKey}`;
    update(ref(database), {
      [`${path}/x`]: Math.round(position.x),
      [`${path}/y`]: Math.round(position.y),
    });
  };

  if (!isVisible) return null;

  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${style.width}px`,
    height: `${style.height}px`,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    cursor: isSelected ? (isDragging ? 'grabbing' : 'grab') : 'default',
    userSelect: 'none',
    boxSizing: 'border-box',
    border: isSelected ? `2px dashed ${isDragging ? 'hsl(var(--primary))' : 'hsl(var(--ring))'}` : 'none',
    zIndex: isSelected ? 1000 : undefined,
    transition: isDragging ? 'none' : 'border-color 0.2s',
  };

  return (
    <div ref={containerRef} style={elementStyle} onMouseDown={handleMouseDown}>
      {children}
    </div>
  );
};

export default DraggableElement;
