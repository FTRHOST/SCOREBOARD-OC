
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

const ScoreboardVoli2 = ({ selectedLayoutElement }: ScoreboardProps) => {
    const { scoreboard, loading } = useVolleyballData();

    if (loading || !scoreboard || !scoreboard.layout) {
        return <div className="w-[1049px] h-64 flex items-center justify-center bg-gray-800 text-white">Loading...</div>;
    }

    const { teamAName, teamBName, teamASets, teamBSets, teamAColor, teamBColor, logoSrc, matchTitle, setHistory, teamAPoints, teamBPoints, currentSet, layout } = scoreboard;
    const isSvg = logoSrc?.startsWith('data:image/svg+xml');

    const displayHistory = [...setHistory];
    if (currentSet >= 1 && currentSet <= setHistory.length) {
        displayHistory[currentSet - 1] = {
            teamAScore: teamAPoints,
            teamBScore: teamBPoints,
        };
    }
    
    const teamAScoreKeys: (keyof VolleyballLayout)[] = ['model2_teamASet1Score', 'model2_teamASet2Score', 'model2_teamASet3Score'];
    const teamBScoreKeys: (keyof VolleyballLayout)[] = ['model2_teamBSet1Score', 'model2_teamBSet2Score', 'model2_teamBSet3Score'];

    return (
        <div className="w-[1049px] h-[256px] relative font-display">
             {Object.keys(layout).filter(k => k.startsWith('model2')).map((key) => {
                const elementKey = key as keyof VolleyballLayout;
                const style = layout[elementKey];
                if (!style) return null;

                let content;
                let isBackground = false;
                let bgColor;
                let isSetScore = false;

                switch (elementKey) {
                    case 'model2_teamABox': isBackground = true; bgColor = teamAColor; break;
                    case 'model2_teamBBox': isBackground = true; bgColor = teamBColor; break;
                    case 'model2_centerScoreBox': isBackground = true; bgColor = '#0F172A'; break;
                    case 'model2_matchTitleBox': isBackground = true; bgColor = '#0F172A'; break;
                    case 'model2_teamASetHistoryBox': isBackground = true; bgColor = undefined; 
                        content = <div className="inline-flex justify-center items-center gap-10 overflow-hidden px-4 h-full w-full">
                           {displayHistory.slice(0, 3).map((set, index) => (
                                <div key={index} className="w-20 h-28 relative">
                                    <div className="w-20 h-20 left-0 top-[21px] absolute" style={{backgroundColor: teamAColor}}></div>
                                </div>
                            ))}
                        </div>;
                        break;
                    case 'model2_teamBSetHistoryBox': isBackground = true; bgColor = undefined;
                        content = <div className="inline-flex justify-center items-center gap-10 overflow-hidden px-4 h-full w-full">
                           {displayHistory.slice(0, 3).map((set, index) => (
                                <div key={index} className="w-20 h-28 relative">
                                    <div className="w-20 h-20 left-0 top-[24px] absolute" style={{backgroundColor: teamBColor}}></div>
                                </div>
                            ))}
                        </div>;
                        break;
                    case 'model2_teamAName': content = <DynamicElement style={style} text={teamAName} isVisible={style.visible} />; break;
                    case 'model2_teamBName': content = <DynamicElement style={style} text={teamBName} isVisible={style.visible} />; break;
                    case 'model2_teamASets': content = <DynamicElement style={style} text={teamASets.toString()} isVisible={style.visible} />; break;
                    case 'model2_teamBSets': content = <DynamicElement style={style} text={teamBSets.toString()} isVisible={style.visible} />; break;
                    case 'model2_matchTitleText': content = <DynamicElement style={style} text={matchTitle} isVisible={style.visible} />; break;
                    case 'model2_logo':
                        content = <DynamicElement style={style} isVisible={style.visible}>
                             {logoSrc ? (
                                <div className="relative w-full h-full">
                                {isSvg ? (
                                    <img src={logoSrc} alt="Uploaded Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <Image src={logoSrc} alt="Uploaded Logo" fill style={{objectFit: "contain"}}/>
                                )}
                                </div>
                            ) : ( <OsisCupLogo className="w-full h-full text-white" /> )}
                        </DynamicElement>;
                        break;
                    default:
                        if (teamAScoreKeys.includes(elementKey) || teamBScoreKeys.includes(elementKey)) {
                            isSetScore = true;
                        } else {
                            return null;
                        }
                }
                
                if (isBackground) {
                    content = <BackgroundElement style={style} color={bgColor} isVisible={style.visible}>{content}</BackgroundElement>
                } else if (isSetScore) {
                    const team = teamAScoreKeys.includes(elementKey) ? 'A' : 'B';
                    const scoreIndex = team === 'A' ? teamAScoreKeys.indexOf(elementKey) : teamBScoreKeys.indexOf(elementKey);
                    if (scoreIndex < displayHistory.length) {
                        const score = team === 'A' ? displayHistory[scoreIndex].teamAScore : displayHistory[scoreIndex].teamBScore;
                        content = <DynamicElement style={style} text={score.toString()} isVisible={style.visible} />;
                    }
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

export default ScoreboardVoli2;
