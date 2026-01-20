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
    const [maxNameWidth, setMaxNameWidth] = useState(0);
    const [fontSizeScale, setFontSizeScale] = useState(1);
    const measureRefA = useRef<HTMLDivElement>(null);
    const measureRefB = useRef<HTMLDivElement>(null);

    const { teamAName, teamBName, teamAPoints, teamBPoints, teamASets, teamBSets, teamAColor, teamBColor, logoSrc, matchTitle, layout } = scoreboard || {};

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
    }, [teamAName, teamBName, layout?.model1_teamAName.fontSize, layout?.model1_teamBName.fontSize]);

    if (loading || !scoreboard || !layout) {
        return <div className="w-[1048px] h-56 flex items-center justify-center bg-black/20 text-white">Loading...</div>;
    }

    const isSvg = logoSrc?.startsWith('data:image/svg+xml');

    const renderOrder: (keyof VolleyballLayout)[] = [
        'model1_centerScoreBox',
        'model1_matchTitleBox',
        'model1_teamASetScoreBox',
        'model1_teamBSetScoreBox',
        'model1_teamAName',
        'model1_teamBName',
        'model1_teamAPoints',
        'model1_teamBPoints',
        'model1_teamASetScoreText',
        'model1_teamBSetScoreText',
        'model1_matchTitleText',
        'model1_logo',
    ];

    return (
        <div className="w-[1048px] h-[224px] relative font-display">
             {/* Hidden measurement elements */}
            <div style={{ position: 'absolute', visibility: 'hidden', height: 0, whiteSpace: 'nowrap', fontSize: `${layout.model1_teamAName.fontSize}px` }} ref={measureRefA}>{teamAName}</div>
            <div style={{ position: 'absolute', visibility: 'hidden', height: 0, whiteSpace: 'nowrap', fontSize: `${layout.model1_teamBName.fontSize}px` }} ref={measureRefB}>{teamBName}</div>

            {renderOrder.map((key) => {
                const elementKey = key as keyof VolleyballLayout;
                if (!key.startsWith('model1')) return null;
                
                const style = layout[elementKey];
                if (!style) return null;

                let content;
                let isBackground = false;
                let bgColor;
                let overrideStyle: React.CSSProperties | undefined;

                switch (elementKey) {
                    // Removed separate name boxes, handled in names
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
                         // Anchor Right
                        const finalWidthA = Math.max(style.width, maxNameWidth);
                        const anchorRight = style.x + style.width;
                        const scaledFontSizeA = (style.fontSize || 88) * fontSizeScale;
                        overrideStyle = {
                            left: 'auto',
                            right: `${1048 - anchorRight}px`,
                            width: `${finalWidthA}px`,
                            justifyContent: 'flex-end',
                            paddingRight: '10px', 
                        };
                        content = <DynamicElement style={{...style, fontSize: scaledFontSizeA}} text={teamAName} isVisible={style.visible} backgroundColor={teamAColor} />;
                        break;
                    case 'model1_teamBName':
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
                        overrideStyle={overrideStyle}
                    >
                        {content}
                    </DraggableElement>
                );
            })}
        </div>
    );
};

export default ScoreboardVoli1;