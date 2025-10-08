"use client";

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export default function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 250); // Half of animation duration
      
      prevValueRef.current = value;

      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className={cn('perspective-1000', className)}>
      <div
        key={value}
        className={cn(
          'transform-style-3d backface-hidden mt-[18px]',
          isAnimating && 'animate-flip'
        )}
      >
        {displayValue}
      </div>
    </div>
  );
}
