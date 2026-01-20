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

const ScoreboardVoli3 = ({ selectedLayoutElement }: ScoreboardProps) => {
    const { scoreboard, loading } = useVolleyballData();
    const [maxNameWidth, setMaxNameWidth] = useState(0);
    const [fontSizeScale, setFontSizeScale] = useState(1);
    const measureRefA = useRef<HTMLDivElement>(null);
    const measureRefB = useRef<HTMLDivElement>(null);

    const { teamAName, teamBName, teamASets, teamBSets, teamAPoints, teamBPoints, teamAColor, teamBColor, logoSrc, matchTitle, setHistory, currentSet, layout } = scoreboard || {};

    // Measure text widths
    useEffect(() => {
        if (measureRefA.current && measureRefB.current && layout) {
            const widthA = measureRefA.current.scrollWidth;
            const widthB = measureRefB.current.scrollWidth;
            const calculatedWidth = Math.max(widthA, widthB) + 40; 
            
            // Allow larger width for Model 3 if needed, or stick to 511. 
            // Given the layout is compact, 511 might be too wide, but consistency is key.
            const MAX_BOX_WIDTH = 511;

            if (calculatedWidth > MAX_BOX_WIDTH) {
                setMaxNameWidth(MAX_BOX_WIDTH);
                setFontSizeScale(MAX_BOX_WIDTH / calculatedWidth);
            } else {
                setMaxNameWidth(calculatedWidth);
                setFontSizeScale(1);
            }
        }
    }, [teamAName, teamBName, layout?.model3_teamANameText.fontSize, layout?.model3_teamBNameText.fontSize]);

    if (loading || !scoreboard || !layout) {
        return <div className="w-[673px] h-52 flex items-center justify-center bg-gray-800 text-white">Loading...</div>;
    }

    const isSvg = logoSrc?.startsWith('data:image/svg+xml');
    
    const displayHistory = [...setHistory];
    if (currentSet >= 1 && currentSet <= setHistory.length) {
        displayHistory[currentSet - 1] = {
            teamAScore: teamAPoints,
            teamBScore: teamBPoints,
        };
    }

    const renderOrder: (keyof VolleyballLayout)[] = [
        'model3_teamASetBox',
        'model3_teamBSetBox',
        'model3_logoBox',
        'model3_teamASetHistoryBox',
        'model3_teamBSetHistoryBox',
        'model3_matchTitleBox',
        'model3_teamANameText',
        'model3_teamBNameText',
        'model3_teamASetsText',
        'model3_teamBSetsText',
        'model3_matchTitleText',
        'model3_logoImage',
    ];

    return (
        <div className="w-[673px] h-[208px] relative font-display">
             {/* Hidden measurement elements */}
            <div style={{ position: 'absolute', visibility: 'hidden', height: 0, whiteSpace: 'nowrap', fontSize: `${layout.model3_teamANameText.fontSize}px` }} ref={measureRefA}>{teamAName}</div>
            <div style={{ position: 'absolute', visibility: 'hidden', height: 0, whiteSpace: 'nowrap', fontSize: `${layout.model3_teamBNameText.fontSize}px` }} ref={measureRefB}>{teamBName}</div>

            {renderOrder.map((key) => {
                const elementKey = key as keyof VolleyballLayout;
                if (!key.startsWith('model3')) return null;

                const style = layout[elementKey];
                if (!style) return null;

                let content;
                let isBackground = false;
                let bgColor;
                let overrideStyle: React.CSSProperties | undefined;

                switch (elementKey) {
                    // Merged Name Boxes into Text
                    case 'model3_teamANameBox': isBackground = true; bgColor = teamAColor; break; // Still render if needed? No, merge.
                    // Wait, if I skip this case, it won't render. 
                    // I will remove it from switch and rely on text rendering.
                    // But I need to ensure it's not rendered via default or other means.
                    // The renderOrder includes it. If I remove case, it hits default -> null. Good.
                    // Same for BBox.
                    
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
                    case 'model3_teamANameText':
                        // Anchor Left (default x position) or Right?
                        // In default layout, it's x=163.
                        // I will keep x anchor and grow Width.
                        const finalWidthA = Math.max(style.width, maxNameWidth);
                        const scaledFontSizeA = (style.fontSize || 48) * fontSizeScale;
                        overrideStyle = {
                            width: `${finalWidthA}px`,
                            fontSize: `${scaledFontSizeA}px`
                        };
                        content = <DynamicElement style={{...style, fontSize: scaledFontSizeA}} text={teamAName} isVisible={style.visible} backgroundColor={teamAColor} />; 
                        break;
                    case 'model3_teamBNameText': 
                        const finalWidthB = Math.max(style.width, maxNameWidth);
                        const scaledFontSizeB = (style.fontSize || 48) * fontSizeScale;
                        overrideStyle = {
                            width: `${finalWidthB}px`,
                            fontSize: `${scaledFontSizeB}px`
                        };
                        content = <DynamicElement style={{...style, fontSize: scaledFontSizeB}} text={teamBName} isVisible={style.visible} backgroundColor={teamBColor} />; 
                        break;
                    case 'model3_teamASetsText': content = <DynamicElement style={style} text={teamASets.toString()} isVisible={style.visible} />; break;
                    case 'model3_teamBSetsText': content = <DynamicElement style={style} text={teamBSets.toString()} isVisible={style.visible} />; break;
                    case 'model3_matchTitleText': content = <DynamicElement style={style} text={matchTitle} isVisible={style.visible} />; break;
                    case 'model3_logoImage':
                        content = <DynamicElement style={style} isVisible={style.visible}>
                            <div className="relative w-full h-full">
                                {logoSrc ? (
                                    isSvg ? (
                                        <img src={logoSrc} alt="Uploaded Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <Image src={logoSrc} alt="Uploaded Logo" fill style={{objectFit: "contain"}}/>
                                    )
                                ) : (
                                    <OsisCupLogo className="w-full h-full text-black" />
                                )}
                            </div>
                        </DynamicElement>;
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
                        overrideStyle={overrideStyle}
                    >
                        {content}
                    </DraggableElement>
                );
            })}
        </div>
    );
};

export default ScoreboardVoli3;