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
    // Update display value immediately if it's the first render or if value changes
    // This prevents showing stale data on initial load.
    if (prevValueRef.current !== value) {
      // Trigger animation
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 250); // Half of the animation duration to allow the flip
      
      prevValueRef.current = value;

      return () => clearTimeout(timer);
    }
  }, [value]);

  // When not animating, just show the plain value.
  // We'll set the displayValue directly when the animation is scheduled.
  // This avoids a flash of the old number during the animation trigger.
  const numberToShow = isAnimating ? prevValueRef.current : value;

  return (
    <div className={cn('perspective-1000', className)}>
      <div
        key={value} // Use value in key to force re-render and trigger animation
        className={cn(
          'transform-style-3d backface-hidden',
          isAnimating && 'animate-flip'
        )}
      >
        {displayValue}
      </div>
    </div>
  );
}
