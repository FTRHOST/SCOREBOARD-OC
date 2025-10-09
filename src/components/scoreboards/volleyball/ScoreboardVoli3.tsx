
"use client";
import React from 'react';
import { useVolleyballData, VolleyballLayoutStyle, VolleyballLayout } from '@/hooks/useVolleyballData';
import Image from 'next/image';
import { OsisCupLogo } from '@/components/icons/OsisCupLogo';
import DraggableElement from '../DraggableElement';

interface ScoreboardProps {
  selectedLayoutElement: keyof VolleyballLayout | null;
}

const DynamicElement = ({ style, children, text, isVisible }: { style: VolleyballLayoutStyle, children?: React.ReactNode, text?: string, isVisible?: boolean }) => {
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

const BackgroundElement = ({ style, color, children, className, isVisible }: { style: VolleyballLayoutStyle, color?: string, children?: React.ReactNode, className?: string, isVisible?: boolean }) => {
  if (isVisible === false) return null;
  
  const elementStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: color,
  };

  return <div style={elementStyle} className={className}>{children}</div>;
};

const ScoreboardVoli3 = ({ selectedLayoutElement }: ScoreboardProps) => {
    const { scoreboard, loading } = useVolleyballData();

    if (loading || !scoreboard || !scoreboard.layout) {
        return <div className="w-[673px] h-52 flex items-center justify-center bg-gray-800 text-white">Loading...</div>;
    }

    const { teamAName, teamBName, teamASets, teamBSets, teamAPoints, teamBPoints, teamAColor, teamBColor, logoSrc, matchTitle, setHistory, currentSet, layout } = scoreboard;
    const isSvg = logoSrc?.startsWith('data:image/svg+xml');
    
    const displayHistory = [...setHistory];
    if (currentSet >= 1 && currentSet <= setHistory.length) {
        displayHistory[currentSet - 1] = {
            teamAScore: teamAPoints,
            teamBScore: teamBPoints,
        };
    }

    return (
        <div className="w-[673px] h-[208px] relative font-display">
            {Object.keys(layout).filter(k => k.startsWith('model3')).map((key) => {
                const elementKey = key as keyof VolleyballLayout;
                const style = layout[elementKey];
                if (!style) return null;

                let content;
                let isBackground = false;
                let bgColor;

                switch (elementKey) {
                    case 'model3_teamANameBox': isBackground = true; bgColor = teamAColor; break;
                    case 'model3_teamBNameBox': isBackground = true; bgColor = teamBColor; break;
                    case 'model3_teamASetBox': isBackground = true; bgColor = '#0F172A'; break;
                    case 'model3_teamBSetBox': isBackground = true; bgColor = '#0F172A'; break;
                    case 'model3_logoBox': isBackground = true; bgColor = 'white'; break;
                    case 'model3_matchTitleBox': isBackground = true; bgColor = '#0F172A'; break;
                    case 'model3_teamASetHistoryBox': isBackground = true;
                        content = <div className="p-5 rounded-[5px] inline-flex justify-center items-center gap-[3px] overflow-hidden w-full h-full">
                           {displayHistory.slice(0, 3).map((set, index) => (
                                <div key={index} className="flex-1 h-16 relative flex justify-center items-center" style={{backgroundColor: teamAColor}}>
                                   <div className="text-center text-white text-6xl">{set.teamAScore}</div>
                               </div>
                           ))}
                       </div>;
                       break;
                    case 'model3_teamBSetHistoryBox': isBackground = true;
                       content = <div className="p-5 rounded-[5px] inline-flex justify-center items-center gap-[3px] overflow-hidden w-full h-full">
                           {displayHistory.slice(0, 3).map((set, index) => (
                                <div key={index} className="flex-1 h-16 relative flex justify-center items-center" style={{backgroundColor: teamBColor}}>
                                   <div className="text-center text-white text-6xl">{set.teamBScore}</div>
                               </div>
                           ))}
                       </div>;
                       break;
                    case 'model3_teamANameText': content = <DynamicElement style={style} text={teamAName} isVisible={style.visible} />; break;
                    case 'model3_teamBNameText': content = <DynamicElement style={style} text={teamBName} isVisible={style.visible} />; break;
                    case 'model3_teamASetsText': content = <DynamicElement style={style} text={teamASets.toString()} isVisible={style.visible} />; break;
                    case 'model3_teamBSetsText': content = <DynamicElement style={style} text={teamBSets.toString()} isVisible={style.visible} />; break;
                    case 'model3_matchTitleText': content = <DynamicElement style={style} text={matchTitle} isVisible={style.visible} />; break;
                    case 'model3_logoImage':
                        content = <div className="relative w-full h-full">
                            {logoSrc ? (
                                isSvg ? (
                                    <img src={logoSrc} alt="Uploaded Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <Image src={logoSrc} alt="Uploaded Logo" fill style={{objectFit: "contain"}}/>
                                )
                            ) : (
                                <OsisCupLogo className="w-full h-full text-black" />
                            )}
                        </div>;
                        break;
                    default:
                        return null;
                }
                
                if (isBackground) {
                    content = <BackgroundElement style={style} color={bgColor} isVisible={style.visible}>{content}</BackgroundElement>;
                }

                return (
                    <DraggableElement
                        key={elementKey}
                        elementKey={elementKey}
                        style={style}
                        selectedElement={selectedLayoutElement}
                        layoutType="volleyball"
                    >
                        {content}
                    </DraggableElement>
                );
            })}
        </div>
    );
};

export default ScoreboardVoli3;
