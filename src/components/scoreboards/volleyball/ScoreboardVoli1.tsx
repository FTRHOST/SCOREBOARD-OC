
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

const BackgroundElement = ({ style, color, isVisible, children }: { style: VolleyballLayoutStyle, color?: string, isVisible?: boolean, children?: React.ReactNode }) => {
  if (isVisible === false) return null;
  
  const elementStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: color,
  };

  return <div style={elementStyle}>{children}</div>;
};


const ScoreboardVoli1 = ({ selectedLayoutElement }: ScoreboardProps) => {
    const { scoreboard, loading } = useVolleyballData();

    if (loading || !scoreboard || !scoreboard.layout) {
        return <div className="w-[1048px] h-56 flex items-center justify-center bg-black/20 text-white">Loading...</div>;
    }

    const { teamAName, teamBName, teamAPoints, teamBPoints, teamASets, teamBSets, teamAColor, teamBColor, logoSrc, matchTitle, layout } = scoreboard;
    const isSvg = logoSrc?.startsWith('data:image/svg+xml');

    return (
        <div className="w-[1048px] h-[224px] relative font-display">
            {Object.keys(layout).filter(k => k.startsWith('model1')).map((key) => {
                const elementKey = key as keyof VolleyballLayout;
                const style = layout[elementKey];
                if (!style) return null;

                let content;
                let isBackground = false;
                let bgColor;

                switch (elementKey) {
                    case 'model1_teamABox':
                        isBackground = true;
                        bgColor = teamAColor;
                        break;
                    case 'model1_teamBBox':
                        isBackground = true;
                        bgColor = teamBColor;
                        break;
                    case 'model1_centerScoreBox':
                        isBackground = true;
                        bgColor = '#0F172A';
                        break;
                    case 'model1_matchTitleBox':
                        isBackground = true;
                        bgColor = '#0F172A';
                        break;
                    case 'model1_teamASetScoreBox':
                        isBackground = true;
                        bgColor = teamAColor;
                        break;
                    case 'model1_teamBSetScoreBox':
                        isBackground = true;
                        bgColor = teamBColor;
                        break;
                    case 'model1_teamAName':
                        content = <DynamicElement style={style} text={teamAName} isVisible={style.visible} />;
                        break;
                    case 'model1_teamBName':
                        content = <DynamicElement style={style} text={teamBName} isVisible={style.visible} />;
                        break;
                    case 'model1_teamAPoints':
                        content = <DynamicElement style={style} text={teamAPoints.toString()} isVisible={style.visible} />;
                        break;
                    case 'model1_teamBPoints':
                        content = <DynamicElement style={style} text={teamBPoints.toString()} isVisible={style.visible} />;
                        break;
                    case 'model1_teamASetScoreText':
                        content = <DynamicElement style={style} text={teamASets.toString()} isVisible={style.visible} />;
                        break;
                    case 'model1_teamBSetScoreText':
                        content = <DynamicElement style={style} text={teamBSets.toString()} isVisible={style.visible} />;
                        break;
                    case 'model1_matchTitleText':
                        content = <DynamicElement style={style} text={matchTitle} isVisible={style.visible} />;
                        break;
                    case 'model1_logo':
                        content = <DynamicElement style={style} isVisible={style.visible}>
                            {logoSrc ? (
                                <div className="relative w-full h-full">
                                {isSvg ? (
                                    <img src={logoSrc} alt="Uploaded Logo" className="w-full h-full object-contain" />
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
                
                if (isBackground) {
                    content = <BackgroundElement style={style} color={bgColor} isVisible={style.visible}>{content}</BackgroundElement>
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

export default ScoreboardVoli1;
