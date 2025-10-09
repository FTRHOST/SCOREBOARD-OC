
'use client';

import { useState, useEffect } from 'react';
import { useScoreboardData, ScoreboardLayout, LayoutStyle } from '@/hooks/useScoreboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { update, ref } from 'firebase/database';
import { useDatabase } from '@/firebase';
import { Switch } from '@/components/ui/switch';

interface LayoutEditorProps {
  onElementSelect: (elementKey: keyof ScoreboardLayout | null) => void;
}

const LayoutEditor = ({ onElementSelect }: LayoutEditorProps) => {
  const { scoreboard } = useScoreboardData();
  const database = useDatabase();
  const [selectedElement, setSelectedElement] = useState<keyof ScoreboardLayout>('model1_teamAScore');
  const [currentStyle, setCurrentStyle] = useState<LayoutStyle | null>(null);

  useEffect(() => {
    if (scoreboard?.layout) {
      setCurrentStyle(scoreboard.layout[selectedElement]);
    }
    onElementSelect(selectedElement);
  }, [selectedElement, scoreboard, onElementSelect]);

  const handleStyleChange = (key: keyof LayoutStyle, value: number) => {
    if (!currentStyle) return;
    const newStyle = { ...currentStyle, [key]: value };
    setCurrentStyle(newStyle);

    if (database) {
      const path = `scoreboard/layout/${selectedElement}`;
      update(ref(database), { [path]: newStyle });
    }
  };
  
  const handleVisibilityChange = (visible: boolean) => {
    if (!currentStyle) return;
    const newStyle = { ...currentStyle, visible };
    setCurrentStyle(newStyle);

    if (database) {
      const path = `scoreboard/layout/${selectedElement}`;
      update(ref(database), { [path]: newStyle });
    }
  };


  if (!scoreboard || !currentStyle) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Layout Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading layout data...</p>
        </CardContent>
      </Card>
    );
  }

  const elementOptions = Object.keys(scoreboard.layout) as Array<keyof ScoreboardLayout>;

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Dynamic Layout Editor</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="element-select">Select Element</Label>
                <Select value={selectedElement} onValueChange={(value) => setSelectedElement(value as keyof ScoreboardLayout)}>
                    <SelectTrigger id="element-select">
                    <SelectValue placeholder="Select an element to edit" />
                    </SelectTrigger>
                    <SelectContent>
                    {elementOptions.map((key) => (
                        <SelectItem key={key} value={key}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="flex items-center space-x-2 pt-6">
                <Switch 
                  id="visibility-switch"
                  checked={currentStyle.visible}
                  onCheckedChange={handleVisibilityChange}
                />
                <Label htmlFor="visibility-switch">Visible</Label>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Position X: {currentStyle.x}px</Label>
            <Slider
              value={[currentStyle.x]}
              max={1200}
              min={-200}
              step={1}
              onValueChange={(value) => handleStyleChange('x', value[0])}
            />
          </div>
          <div>
            <Label>Position Y: {currentStyle.y}px</Label>
            <Slider
              value={[currentStyle.y]}
              max={800}
              min={-200}
              step={1}
              onValueChange={(value) => handleStyleChange('y', value[0])}
            />
          </div>
          <div>
            <Label>Width: {currentStyle.width}px</Label>
            <Slider
              value={[currentStyle.width]}
              max={1200}
              step={1}
              onValueChange={(value) => handleStyleChange('width', value[0])}
            />
          </div>
          <div>
            <Label>Height: {currentStyle.height}px</Label>
            <Slider
              value={[currentStyle.height]}
              max={800}
              step={1}
              onValueChange={(value) => handleStyleChange('height', value[0])}
            />
          </div>
          <div>
            <Label>Font Size: {currentStyle.fontSize || 0}px</Label>
            <Slider
              value={[currentStyle.fontSize || 0]}
              max={200}
              step={1}
              onValueChange={(value) => handleStyleChange('fontSize', value[0])}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LayoutEditor;
