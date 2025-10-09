
"use client";

import React, { useEffect, useState } from 'react';
import { useScoreboardData, LayoutStyle } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import { cn } from "@/lib/utils";
import Image from 'next/image';

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const DynamicElement = ({ style, color, children, text, className, isVisible }: { style: LayoutStyle, color?: string, children?: React.ReactNode, text?: string, className?: string, isVisible?: boolean }) => {
  if (isVisible === false) return null;

  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${style.x}px`,
    top: `${style.y}px`,
    width: `${style.width}px`,
    height: `${style.height}px`,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 1.1,
  };

  return (
    <div style={elementStyle} className={cn(className, 'truncate')}>
        {text}
        {children}
    </div>
  );
};


const Scoreboard3 = () => {
  const { scoreboard, loading } = useScoreboardData();
  
  const [flashA, setFlashA] = useState(false);
  const [flashB, setFlashB] = useState(false);
  
  const prevFoulsA = usePrevious(scoreboard?.teamAFouls);
  const prevFoulsB = usePrevious(scoreboard?.teamBFouls);

  useEffect(() => {
    if (scoreboard && prevFoulsA !== undefined && scoreboard.teamAFouls > prevFoulsA) {
      setFlashA(true);
      setTimeout(() => setFlashA(false), 400);
    }
  }, [scoreboard?.teamAFouls, prevFoulsA]);

  useEffect(() => {
    if (scoreboard && prevFoulsB !== undefined && scoreboard.teamBFouls > prevFoulsB) {
      setFlashB(true);
      setTimeout(() => setFlashB(false), 400);
    }
  }, [scoreboard?.teamBFouls, prevFoulsB]);

  if (loading || !scoreboard || !scoreboard.layout) {
    return (
         <div className="bg-green-500 p-2 rounded-lg w-full h-full font-display text-white shadow-2xl flex items-center justify-center">
            <OsisCupLogo className="w-24 h-24 text-primary animate-pulse" />
        </div>
    );
  }
  
  const { layout, teamAName, teamBName, teamAScore, teamBScore, teamAFouls, teamBFouls, time, half, teamAColor, teamBColor, logoSrc } = scoreboard;

  const isSvg = logoSrc?.startsWith('data:image/svg+xml');

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const getShortHalf = (fullHalf: string) => {
    if (!fullHalf) return '';
    const words = fullHalf.toLowerCase().split(' ');
    if (words.includes('1') || words.includes('first')) return '1st';
    if (words.includes('2') || words.includes('second')) return '2nd';
    if (words.includes('extra')) return 'ET';
    return fullHalf.substring(0, 3).toUpperCase();
  }

  return (
    <div className="bg-green-500 w-[448px] h-[154px] font-display text-white shadow-2xl relative">
        {/* Logo Section */}
        <div style={{ position: 'absolute', left: `${layout.model3_logo.x}px`, top: `${layout.model3_logo.y}px`, width: `${layout.model3_logo.width}px`, height: `${layout.model3_logo.height}px`, backgroundColor: 'white' }}
          className="flex items-center justify-center p-2"
        >
          {logoSrc ? (
            <div className="relative w-full h-full">
              {isSvg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} alt="Uploaded Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <Image 
                  src={logoSrc} 
                  alt="Uploaded Logo" 
                  fill
                  style={{objectFit: "contain"}}
                />
              )}
            </div>
          ) : (
            <OsisCupLogo className="w-full h-full text-primary" />
          )}
        </div>

        {/* Info Section */}
        {/* Row 1: Team A, Score A, Foul A */}
        <DynamicElement style={layout.model3_teamAName} color={teamAColor} text={teamAName} isVisible={layout.model3_teamAName.visible} />
        <DynamicElement style={layout.model3_teamAScore} color="#1F2937" isVisible={layout.model3_teamAScore.visible}>
          <AnimatedNumber value={teamAScore} />
        </DynamicElement>
        <DynamicElement style={layout.model3_teamAFouls} color={teamAColor} className={cn(flashA && "animate-flash")} text={teamAFouls.toString()} isVisible={layout.model3_teamAFouls.visible} />
        
        {/* Row 2: Team B, Score B, Foul B */}
        <DynamicElement style={layout.model3_teamBName} color={teamBColor} text={teamBName} isVisible={layout.model3_teamBName.visible} />
        <DynamicElement style={layout.model3_teamBScore} color="#1F2937" isVisible={layout.model3_teamBScore.visible}>
          <AnimatedNumber value={teamBScore} />
        </DynamicElement>
        <DynamicElement style={layout.model3_teamBFouls} color={teamBColor} className={cn(flashB && "animate-flash")} text={teamBFouls.toString()} isVisible={layout.model3_teamBFouls.visible} />
        
        {/* Row 3: Half, Timer */}
        <DynamicElement style={layout.model3_half} color="#1F2937" text={getShortHalf(half)} isVisible={layout.model3_half.visible} />
        <DynamicElement style={layout.model3_time} color="#374151" text={formatTime(time)} isVisible={layout.model3_time.visible} />
    </div>
  );
};


export default Scoreboard3;
