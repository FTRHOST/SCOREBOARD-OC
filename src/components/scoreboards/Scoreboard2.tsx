
"use client";

import React, { useEffect, useState } from 'react';
import { useScoreboardData, LayoutStyle } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import { cn } from "@/lib/utils";
import Image from 'next/image';

// Helper hook to get previous value
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
    <div style={elementStyle} className={className}>
      <div className="truncate px-2">
        {text}
        {children}
      </div>
    </div>
  );
};

const Scoreboard2 = () => {
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
      <div className="w-[1048px] h-[291px] flex items-center justify-center text-white font-display bg-black/20">
         <OsisCupLogo className="w-32 h-32 text-white/50 animate-pulse" />
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

  return (
    <div className="w-[1048px] h-[291px] relative font-display text-white">
        {/* Latar Belakang */}
        <div style={{ position: 'absolute', left: `${layout.model2_teamAName.x}px`, top: `${layout.model2_teamAName.y}px`, width: `${layout.model2_teamAName.width}px`, height: `${layout.model2_teamAName.height}px`, backgroundColor: teamAColor || '#B62FCE' }} />
        <div style={{ position: 'absolute', left: `${layout.model2_teamBName.x}px`, top: `${layout.model2_teamBName.y}px`, width: `${layout.model2_teamBName.width}px`, height: `${layout.model2_teamBName.height}px`, backgroundColor: teamBColor || '#EF7438' }} />
        <div style={{ position: 'absolute', left: '320px', top: '41px', width: '408px', height: '105px', backgroundColor: '#05183B' }} />
        
        <div style={{ position: 'absolute', left: `${layout.model2_time.x}px`, top: `${layout.model2_time.y}px`, width: `${layout.model2_time.width}px`, height: `${layout.model2_time.height}px`, backgroundColor: '#05183B' }} />
        <div style={{ position: 'absolute', left: `${layout.model2_half.x}px`, top: `${layout.model2_half.y}px`, width: `${layout.model2_half.width}px`, height: `${layout.model2_half.height}px`, backgroundColor: '#05183B' }} />
        
        <div className={cn(flashA && "animate-flash")} style={{ position: 'absolute', left: `${layout.model2_teamAFouls.x}px`, top: `${layout.model2_teamAFouls.y}px`, width: `${layout.model2_teamAFouls.width}px`, height: `${layout.model2_teamAFouls.height}px`, backgroundColor: teamAColor || '#B62FCE' }} />
        <div className={cn(flashB && "animate-flash")} style={{ position: 'absolute', left: `${layout.model2_teamBFouls.x}px`, top: `${layout.model2_teamBFouls.y}px`, width: `${layout.model2_teamBFouls.width}px`, height: `${layout.model2_teamBFouls.height}px`, backgroundColor: teamBColor || '#EF7438'}}/>

        {/* Konten Teks */}
        <DynamicElement style={layout.model2_teamAName} text={teamAName} isVisible={layout.model2_teamAName.visible} />
        <DynamicElement style={layout.model2_teamBName} text={teamBName} isVisible={layout.model2_teamBName.visible} />
        
        {/* Skor */}
        <DynamicElement style={layout.model2_teamAScore} isVisible={layout.model2_teamAScore.visible}>
             <AnimatedNumber value={teamAScore} />
        </DynamicElement>
        <DynamicElement style={layout.model2_teamBScore} isVisible={layout.model2_teamBScore.visible}>
            <AnimatedNumber value={teamBScore} />
        </DynamicElement>

        {/* Pelanggaran */}
        <DynamicElement style={layout.model2_teamAFouls} isVisible={layout.model2_teamAFouls.visible}>
            <AnimatedNumber value={teamAFouls} />
        </DynamicElement>
        <DynamicElement style={layout.model2_teamBFouls} isVisible={layout.model2_teamBFouls.visible}>
            <AnimatedNumber value={teamBFouls} />
        </DynamicElement>

        {/* Waktu & Babak */}
        <DynamicElement style={layout.model2_time} text={formatTime(time)} isVisible={layout.model2_time.visible} />
        <DynamicElement style={layout.model2_half} text={half} isVisible={layout.model2_half.visible} />
        
        {/* Logo */}
        <DynamicElement style={layout.model2_logo} isVisible={layout.model2_logo.visible}>
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
                <OsisCupLogo className="w-full h-full text-white" />
            )}
        </DynamicElement>
    </div>
  );
};

export default Scoreboard2;
