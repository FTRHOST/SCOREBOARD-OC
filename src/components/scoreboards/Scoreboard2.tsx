
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

const DynamicElement = ({ style, children, text, isVisible }: { style: LayoutStyle, children?: React.ReactNode, text?: string, isVisible?: boolean }) => {
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
    <div style={elementStyle}>
      <div className="truncate px-2">
        {text}
        {children}
      </div>
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

  return <div style={elementStyle} className={className}>{children}</div>;
};

const Scoreboard2 = ({ selectedLayoutElement }: ScoreboardProps) => {
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

  // Dummy background elements for non-text components to establish a base layer
  const staticBackgrounds = {
      model2_teamANameBG: { style: layout.model2_teamAName, color: teamAColor || '#B62FCE' },
      model2_teamBNameBG: { style: layout.model2_teamBName, color: teamBColor || '#EF7438' },
      model2_teamAScoreBG: { style: { ...layout.model2_teamAScore, x: 320, y: 41, width: 408, height: 105 }, color: '#05183B'},
      model2_teamAFoulsBG: { style: layout.model2_teamAFouls, color: teamAColor || '#B62FCE', flash: flashA },
      model2_teamBFoulsBG: { style: layout.model2_teamBFouls, color: teamBColor || '#EF7438', flash: flashB },
      model2_timeBG: { style: layout.model2_time, color: '#05183B' },
      model2_halfBG: { style: layout.model2_half, color: '#05183B' },
  };

  return (
    <div className="w-[1048px] h-[291px] relative font-display text-white">
      {Object.entries(staticBackgrounds).map(([key, {style, color, flash}]) => (
          <div key={key} style={{position: 'absolute', left: `${style.x}px`, top: `${style.y}px`, width: `${style.width}px`, height: `${style.height}px`, backgroundColor: color}} className={cn(flash && "animate-flash")} />
      ))}

      {Object.keys(layout).filter(k => k.startsWith('model2')).map((key) => {
        const elementKey = key as keyof ScoreboardLayout;
        const style = layout[elementKey];
        if (!style) return null;

        let content: React.ReactNode;
        switch (elementKey) {
          case 'model2_teamAName':
            content = <DynamicElement style={style} text={teamAName} isVisible={style.visible} />;
            break;
          case 'model2_teamBName':
            content = <DynamicElement style={style} text={teamBName} isVisible={style.visible} />;
            break;
          case 'model2_teamAScore':
            content = <DynamicElement style={style} isVisible={style.visible}><AnimatedNumber value={teamAScore} /></DynamicElement>;
            break;
          case 'model2_teamBScore':
            content = <DynamicElement style={style} isVisible={style.visible}><AnimatedNumber value={teamBScore} /></DynamicElement>;
            break;
          case 'model2_teamAFouls':
            content = <DynamicElement style={style} isVisible={style.visible}><AnimatedNumber value={teamAFouls} /></DynamicElement>;
            break;
          case 'model2_teamBFouls':
            content = <DynamicElement style={style} isVisible={style.visible}><AnimatedNumber value={teamBFouls} /></DynamicElement>;
            break;
          case 'model2_time':
            content = <DynamicElement style={style} text={formatTime(time)} isVisible={style.visible} />;
            break;
          case 'model2_half':
            content = <DynamicElement style={style} text={half} isVisible={style.visible} />;
            break;
          case 'model2_logo':
            content = <DynamicElement style={style} isVisible={style.visible}>
              {logoSrc ? (
                <div className="relative w-full h-full">
                  {isSvg ? (
                    <img src={logoSrc} alt="Uploaded Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Image src={logoSrc} alt="Uploaded Logo" fill style={{ objectFit: "contain" }} />
                  )}
                </div>
              ) : (
                <OsisCupLogo className="w-full h-full text-white" />
              )}
            </DynamicElement>;
            break;
          default:
            return null;
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

export default Scoreboard2;
