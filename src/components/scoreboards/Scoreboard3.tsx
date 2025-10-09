
"use client";

import React, { useEffect, useState } from 'react';
import { useScoreboardData, LayoutStyle, ScoreboardLayout } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import { cn } from "@/lib/utils";
import Image from 'next/image';
import DraggableElement from './DraggableElement';

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

interface ScoreboardProps {
  selectedLayoutElement: keyof ScoreboardLayout | null;
}

const DynamicElement = ({ style, children, text, className, isVisible }: { style: LayoutStyle, children?: React.ReactNode, text?: string, className?: string, isVisible?: boolean }) => {
  if (isVisible === false) return null;

  const elementStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
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

const BackgroundElement = ({ style, color, isVisible, children, className }: { style: LayoutStyle, color?: string, isVisible?: boolean, children?: React.ReactNode, className?: string }) => {
  if (isVisible === false) return null;
  
  const elementStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: color,
  };

  return <div style={elementStyle} className={cn(className)}>{children}</div>;
};

const Scoreboard3 = ({ selectedLayoutElement }: ScoreboardProps) => {
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
         <div className="w-full h-full font-display text-white shadow-2xl flex items-center justify-center">
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
    <div className="w-[450px] h-[162px] font-display text-white shadow-2xl relative">
      {Object.keys(layout).filter(k => k.startsWith('model3')).map((key) => {
        const elementKey = key as keyof ScoreboardLayout;
        const style = layout[elementKey];
        if (!style) return null;
        
        let content: React.ReactNode;
        let isBackground = false;
        let bgColor;
        let flashClass;

        switch(elementKey) {
            case 'model3_teamAName': isBackground=true; bgColor=teamAColor; content=<DynamicElement style={style} text={teamAName} isVisible={style.visible} />; break;
            case 'model3_teamAScore': isBackground=true; bgColor="#1F2937"; content=<DynamicElement style={style} isVisible={style.visible}><AnimatedNumber value={teamAScore} /></DynamicElement>; break;
            case 'model3_teamAFouls': isBackground=true; bgColor=teamAColor; flashClass = flashA ? 'animate-flash' : ''; content=<DynamicElement style={style} text={teamAFouls.toString()} isVisible={style.visible} />; break;

            case 'model3_teamBName': isBackground=true; bgColor=teamBColor; content=<DynamicElement style={style} text={teamBName} isVisible={style.visible} />; break;
            case 'model3_teamBScore': isBackground=true; bgColor="#1F2937"; content=<DynamicElement style={style} isVisible={style.visible}><AnimatedNumber value={teamBScore} /></DynamicElement>; break;
            case 'model3_teamBFouls': isBackground=true; bgColor=teamBColor; flashClass = flashB ? 'animate-flash' : ''; content=<DynamicElement style={style} text={teamBFouls.toString()} isVisible={style.visible} />; break;
            
            case 'model3_half': isBackground=true; bgColor="#1F2937"; content=<DynamicElement style={style} text={getShortHalf(half)} isVisible={style.visible} />; break;
            case 'model3_time': isBackground=true; bgColor="#374151"; content=<DynamicElement style={style} text={formatTime(time)} isVisible={style.visible} />; break;

            case 'model3_logo':
                isBackground=true;
                bgColor="white";
                content = <div className="p-2 w-full h-full">
                {logoSrc ? (
                    <div className="relative w-full h-full">
                    {isSvg ? (
                        <img src={logoSrc} alt="Uploaded Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <Image src={logoSrc} alt="Uploaded Logo" fill style={{objectFit: "contain"}}/>
                    )}
                    </div>
                ) : (
                    <OsisCupLogo className="w-full h-full text-primary" />
                )}
                </div>;
                break;
            default: return null;
        }

        if (isBackground) {
            content = <BackgroundElement style={style} color={bgColor} isVisible={style.visible} className={flashClass}>{content}</BackgroundElement>
        }

        return (
          <DraggableElement
            key={elementKey}
            elementKey={elementKey}
            style={style}
            selectedElement={selectedLayoutElement}
            layoutType="futsal"
          >
            {content}
          </DraggableElement>
        );
      })}
    </div>
  );
};


export default Scoreboard3;
