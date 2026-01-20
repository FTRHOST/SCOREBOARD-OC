"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useVolleyballData, VolleyballLayoutStyle, VolleyballLayout } from '@/hooks/useVolleyballData';
import Image from 'next/image';
import { OsisCupLogo } from '@/components/icons/OsisCupLogo';
import DraggableElement from '../DraggableElement';

interface ScoreboardProps {
  selectedLayoutElement: keyof VolleyballLayout | null;
}

const DynamicElement = ({ style, children, text, isVisible, backgroundColor }: { style: VolleyballLayoutStyle, children?: React.ReactNode, text?: string, isVisible?: boolean, backgroundColor?: string }) => {
  if (isVisible === false) return null;
  
  const elementStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    // overflow: 'hidden', // Removed
    textAlign: 'center',
    lineHeight: 1.1,
    backgroundColor: backgroundColor,
    whiteSpace: 'nowrap',
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
  };

  return (
    <div style={elementStyle}>
      {children ? children : (
        <div className="px-2">
          {text}
        </div>
      )}
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
    const [maxNameWidth, setMaxNameWidth] = useState(0);
    const [fontSizeScale, setFontSizeScale] = useState(1);
    const measureRefA = useRef<HTMLDivElement>(null);
    const measureRefB = useRef<HTMLDivElement>(null);

    const { teamAName, teamBName, teamASets, teamBSets, teamAColor, teamBColor, logoSrc, matchTitle, setHistory, teamAPoints, teamBPoints, currentSet, layout } = scoreboard || {};

    // Measure text widths
    useEffect(() => {
        if (measureRefA.current && measureRefB.current && layout) {
            const widthA = measureRefA.current.scrollWidth;
            const widthB = measureRefB.current.scrollWidth;
            const calculatedWidth = Math.max(widthA, widthB) + 40; 
            
            const MAX_BOX_WIDTH = 511;

            if (calculatedWidth > MAX_BOX_WIDTH) {
                setMaxNameWidth(MAX_BOX_WIDTH);
                setFontSizeScale(MAX_BOX_WIDTH / calculatedWidth);
            } else {
                setMaxNameWidth(calculatedWidth);
                setFontSizeScale(1);
            }
        }
    }, [teamAName, teamBName, layout?.model2_teamAName.fontSize, layout?.model2_teamBName.fontSize]);

    if (loading || !scoreboard || !layout) {
        return <div className="w-[1049px] h-64 flex items-center justify-center bg-gray-800 text-white">Loading...</div>;
    }

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

    const renderOrder: (keyof VolleyballLayout)[] = [
        'model2_centerScoreBox',
        'model2_matchTitleBox',
        'model2_teamASetHistoryBox',
        'model2_teamBSetHistoryBox',
        'model2_teamAName',
        'model2_teamBName',
        'model2_teamASets',
        'model2_teamBSets',
        'model2_matchTitleText',
        'model2_teamASet1Score',
        'model2_teamASet2Score',
        'model2_teamASet3Score',
        'model2_teamBSet1Score',
        'model2_teamBSet2Score',
        'model2_teamBSet3Score',
        'model2_logo',
    ];

    return (
        <div className="w-[1049px] h-[256px] relative font-display">
             {/* Hidden measurement elements */}
            <div style={{ position: 'absolute', visibility: 'hidden', height: 0, whiteSpace: 'nowrap', fontSize: `${layout.model2_teamAName.fontSize}px` }} ref={measureRefA}>{teamAName}</div>
            <div style={{ position: 'absolute', visibility: 'hidden', height: 0, whiteSpace: 'nowrap', fontSize: `${layout.model2_teamBName.fontSize}px` }} ref={measureRefB}>{teamBName}</div>

             {renderOrder.map((key) => {
                const elementKey = key as keyof VolleyballLayout;
                if (!key.startsWith('model2')) return null;

                const style = layout[elementKey];
                if (!style) return null;

                let content;
                let isBackground = false;
                let bgColor;
                let isSetScore = false;
                let overrideStyle: React.CSSProperties | undefined;

                switch (elementKey) {
                    // Merged boxes into names
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
                    case 'model2_teamAName':
                        // Anchor Right
                        const finalWidthA = Math.max(style.width, maxNameWidth);
                        const anchorRight = style.x + style.width;
                        const scaledFontSizeA = (style.fontSize || 88) * fontSizeScale;
                        overrideStyle = {
                            left: 'auto',
                            right: `${1049 - anchorRight}px`, // Width is 1049 for Voli 2
                            width: `${finalWidthA}px`,
                            justifyContent: 'flex-end',
                            paddingRight: '10px', 
                        };
                        content = <DynamicElement style={{...style, fontSize: scaledFontSizeA}} text={teamAName} isVisible={style.visible} backgroundColor={teamAColor} />;
                        break;
                    case 'model2_teamBName':
                        // Anchor Left
                        const finalWidthB = Math.max(style.width, maxNameWidth);
                        const scaledFontSizeB = (style.fontSize || 88) * fontSizeScale;
                        overrideStyle = {
                            width: `${finalWidthB}px`,
                            justifyContent: 'flex-start',
                            paddingLeft: '10px',
                        };
                        content = <DynamicElement style={{...style, fontSize: scaledFontSizeB}} text={teamBName} isVisible={style.visible} backgroundColor={teamBColor} />;
                        break;
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
                        overrideStyle={overrideStyle}
                    >
                        {content}
                    </DraggableElement>
                );
            })}
        </div>
    );
};

export default ScoreboardVoli2;