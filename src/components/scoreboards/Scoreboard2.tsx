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

const DynamicElement = ({ style, children, text, isVisible, backgroundColor }: { style: LayoutStyle, children?: React.ReactNode, text?: string, isVisible?: boolean, backgroundColor?: string }) => {
  if (isVisible === false) return null;
  
  const elementStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    // overflow: 'hidden', // Removed to allow expansion
    textAlign: 'center',
    lineHeight: 1.1,
    backgroundColor: backgroundColor,
    whiteSpace: 'nowrap', // Keep text on one line
  };

  return (
    <div style={elementStyle}>
      {children ? children : (
        <div className="px-2"> {/* Removed truncate class */}
          {text}
        </div>
      )}
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
  
  const [maxNameWidth, setMaxNameWidth] = useState(0);
  const measureRefA = React.useRef<HTMLDivElement>(null);
  const measureRefB = React.useRef<HTMLDivElement>(null);
  
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

  // Measure text widths for symmetry
  useEffect(() => {
    if (measureRefA.current && measureRefB.current) {
        const widthA = measureRefA.current.scrollWidth;
        const widthB = measureRefB.current.scrollWidth;
        // Add padding/buffer
        const maxWidth = Math.max(widthA, widthB) + 40; 
        
        setMaxNameWidth(maxWidth); 
    }
  }, [scoreboard?.teamAName, scoreboard?.teamBName, scoreboard?.layout.model2_teamAName.fontSize, scoreboard?.layout.model2_teamBName.fontSize]);
  
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

  const staticBackgrounds = {
      // Name backgrounds removed to allow dynamic sizing
      model2_teamAScoreBG: { style: { ...layout.model2_teamAScore, x: 320, y: 41, width: 408, height: 105 }, color: '#05183B'},
      model2_teamAFoulsBG: { style: layout.model2_teamAFouls, color: teamAColor || '#B62FCE', flash: flashA },
      model2_teamBFoulsBG: { style: layout.model2_teamBFouls, color: teamBColor || '#EF7438', flash: flashB },
      model2_foulsALabelBG: { style: layout.model2_foulsALabel, color: teamAColor || '#B62FCE' },
      model2_foulsBLabelBG: { style: layout.model2_foulsBLabel, color: teamBColor || '#EF7438' },
      model2_timeBG: { style: layout.model2_time, color: '#05183B' },
      model2_halfBG: { style: layout.model2_half, color: '#05183B' },
  };

  const renderOrder: (keyof ScoreboardLayout)[] = [
    'model2_teamAName',
    'model2_teamBName',
    'model2_teamAScore',
    'model2_teamBScore',
    'model2_teamAFouls',
    'model2_teamBFouls',
    'model2_foulsALabel',
    'model2_foulsBLabel',
    'model2_time',
    'model2_half',
    'model2_logo',
  ];

  return (
    <div className="w-[1048px] h-[291px] relative font-display text-white">
      {/* Hidden measurement elements */}
      <div style={{ position: 'absolute', visibility: 'hidden', height: 0, whiteSpace: 'nowrap', fontSize: `${layout.model2_teamAName.fontSize}px` }} ref={measureRefA}>{teamAName}</div>
      <div style={{ position: 'absolute', visibility: 'hidden', height: 0, whiteSpace: 'nowrap', fontSize: `${layout.model2_teamBName.fontSize}px` }} ref={measureRefB}>{teamBName}</div>

      {Object.entries(staticBackgrounds).map(([key, {style, color, flash}]) => (
          style ? <div key={key} style={{position: 'absolute', left: `${style.x}px`, top: `${style.y}px`, width: `${style.width}px`, height: `${style.height}px`, backgroundColor: color}} className={cn(flash && "animate-flash")} /> : null
      ))}

      {renderOrder.map((key) => {
        const elementKey = key as keyof ScoreboardLayout;
        const style = layout[elementKey];
        if (!style) return null;

        let content: React.ReactNode;
        let overrideStyle: React.CSSProperties | undefined;

        switch (elementKey) {
          case 'model2_teamAName':
            // Anchor Right
            const finalWidthA = Math.max(style.width, maxNameWidth);
            const anchorRight = style.x + style.width;
            overrideStyle = {
                left: 'auto',
                right: `${1048 - anchorRight}px`,
                width: `${finalWidthA}px`,
                justifyContent: 'flex-end',
                paddingRight: '10px', 
            };
            content = <DynamicElement style={style} text={teamAName} isVisible={style.visible} backgroundColor={teamAColor || '#B62FCE'} />;
            break;
          case 'model2_teamBName':
            // Anchor Left
            const finalWidthB = Math.max(style.width, maxNameWidth);
            overrideStyle = {
                width: `${finalWidthB}px`,
                justifyContent: 'flex-start',
                paddingLeft: '10px',
            };
            content = <DynamicElement style={style} text={teamBName} isVisible={style.visible} backgroundColor={teamBColor || '#EF7438'} />;
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
          case 'model2_foulsALabel':
            content = <DynamicElement style={style} text="FOULS" isVisible={style.visible} />;
            break;
          case 'model2_foulsBLabel':
            content = <DynamicElement style={style} text="FOULS" isVisible={style.visible} />;
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
            overrideStyle={overrideStyle}
          >
            {content}
          </DraggableElement>
        );
      })}
    </div>
  );
};

export default Scoreboard2;