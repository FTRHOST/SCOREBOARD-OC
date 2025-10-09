
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
    // Update internal position when style prop changes, if not dragging
    if (!isDragging) {
      setPosition({ x: style.x, y: style.y });
    }
  }, [style.x, style.y, isDragging]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelected || !database) return;

    // Prevent default browser behavior, like text selection
    e.preventDefault();
    setIsDragging(true);

    const el = e.currentTarget as HTMLDivElement;
    const parent = el.offsetParent as HTMLElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    
    // The scale is determined by the ratio of the bounding box width to the offsetWidth
    const scale = parentRect.width / parent.offsetWidth;

    // Calculate the initial offset from the element's top-left corner
    // We need to account for the parent's position and the current scale
    const startX = (e.clientX - parentRect.left) / scale;
    const startY = (e.clientY - parentRect.top) / scale;
    
    offsetRef.current = {
      x: startX - position.x,
      y: startY - position.y,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const parent = containerRef.current?.offsetParent as HTMLElement;
    if (!parent || !isDragging) return;

    const parentRect = parent.getBoundingClientRect();
    const scale = parentRect.width / parent.offsetWidth;

    // Calculate new position based on mouse movement, offset, and scale
    const newX = (e.clientX - parentRect.left) / scale - offsetRef.current.x;
    const newY = (e.clientY - parentRect.top) / scale - offsetRef.current.y;
    
    // Update local state to give immediate visual feedback
    setPosition({ x: newX, y: newY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Only update database if dragging was actually active
    if (isDragging && database) {
        const path = `${layoutType === 'futsal' ? 'scoreboard' : 'volleyball'}/layout/${elementKey}`;
        // Use the final position from the state
        update(ref(database), {
          [`${path}/x`]: Math.round(position.x),
          [`${path}/y`]: Math.round(position.y),
        });
    }
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
    zIndex: isSelected ? 1000 : 100, // Ensure selected is on top
    transition: isDragging ? 'none' : 'border-color 0.2s',
  };

  return (
    <div ref={containerRef} style={elementStyle} onMouseDown={handleMouseDown}>
      {children}
    </div>
  );
};

export default DraggableElement;
