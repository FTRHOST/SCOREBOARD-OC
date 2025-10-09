
"use client";

import { useScoreboardData, LayoutStyle, ScoreboardLayout } from "@/hooks/useScoreboardData";
import { OsisCupLogo } from "@/components/icons/OsisCupLogo";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import Image from 'next/image';
import DraggableElement from './DraggableElement';

const DynamicElement = ({ style, children, text, isVisible, backgroundColor, className }: { style: LayoutStyle, children?: React.ReactNode, text?: string, isVisible?: boolean, backgroundColor?: string, className?: string }) => {
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
    backgroundColor: backgroundColor,
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


const Scoreboard1 = ({ selectedLayoutElement }: { selectedLayoutElement: keyof ScoreboardLayout | null }) => {
  const { scoreboard, loading } = useScoreboardData();

  if (loading || !scoreboard || !scoreboard.layout) {
    return (
       <div className="w-[1048px] h-[227px] flex items-center justify-center text-white font-display bg-black/20">
        Loading Scoreboard...
      </div>
    );
  }

  const { layout, teamAName, teamBName, teamAScore, teamBScore, half, teamAColor, teamBColor, logoSrc } = scoreboard;
  
  const isSvg = logoSrc?.startsWith('data:image/svg+xml');
  
  const renderOrder: (keyof ScoreboardLayout)[] = ['model1_scoreContainer', 'model1_teamAName', 'model1_teamBName', 'model1_teamAScore', 'model1_teamBScore', 'model1_half', 'model1_logo'];

  return (
    <div className="w-[1048px] h-[227px] relative font-display text-white bg-transparent">
      {renderOrder.map((key) => {
        const elementKey = key as keyof ScoreboardLayout;
        const style = layout[elementKey];
        if (!style) return null;

        let content: React.ReactNode;
        let bgColor: string | undefined;

        switch (elementKey) {
          case 'model1_scoreContainer':
            bgColor = '#05183B';
            content = <DynamicElement style={style} isVisible={style.visible} backgroundColor={bgColor} />;
            break;
          case 'model1_teamAName':
            bgColor = teamAColor || '#B62FCE';
            content = <DynamicElement style={style} text={teamAName} isVisible={style.visible} backgroundColor={bgColor}/>;
            break;
          case 'model1_teamBName':
            bgColor = teamBColor || '#EF7438';
            content = <DynamicElement style={style} text={teamBName} isVisible={style.visible} backgroundColor={bgColor}/>;
            break;
          case 'model1_teamAScore':
             content = <DynamicElement style={style} isVisible={style.visible}><AnimatedNumber value={teamAScore} /></DynamicElement>;
            break;
          case 'model1_teamBScore':
            content = <DynamicElement style={style} isVisible={style.visible}><AnimatedNumber value={teamBScore} /></DynamicElement>;
            break;
          case 'model1_half':
            bgColor = '#05183B';
            content = <DynamicElement style={style} text={half} isVisible={style.visible} backgroundColor={bgColor}/>;
            break;
          case 'model1_logo':
            content = <DynamicElement style={style} isVisible={style.visible}>
              {logoSrc ? (
                <div className="relative w-full h-full">
                  {isSvg ? (
                    <img src={logoSrc} alt="Uploaded Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Image src={logoSrc} alt="Uploaded Logo" fill style={{objectFit: "contain"}} />
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

export default Scoreboard1;
