
'use client';

import { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { useVolleyballData, VolleyballLayout, VolleyballLayoutStyle } from '@/hooks/useVolleyballData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { update, ref } from 'firebase/database';
import { useDatabase } from '@/firebase';
import { Switch } from '@/components/ui/switch';

interface VolleyballLayoutEditorProps {
  onElementSelect: (elementKey: keyof VolleyballLayout | null) => void;
  selectedModel: string;
}

const VolleyballLayoutEditor = ({ onElementSelect, selectedModel }: VolleyballLayoutEditorProps) => {
  const { scoreboard } = useVolleyballData();
  const database = useDatabase();
  const [selectedElement, setSelectedElement] = useState<keyof VolleyballLayout>('model1_teamAName');
  const [currentStyle, setCurrentStyle] = useState<VolleyballLayoutStyle | null>(null);
  const prevSelectedModel = useRef<string | null>(null);
  const [inputValues, setInputValues] = useState({
    x: '0',
    y: '0',
    width: '0',
    height: '0',
    fontSize: '0',
  });

  useEffect(() => {
    if (selectedModel && selectedModel !== prevSelectedModel.current) {
        prevSelectedModel.current = selectedModel;
        const firstElement = (Object.keys(scoreboard?.layout || {}) as Array<keyof VolleyballLayout>).find(key => key.startsWith(`model${selectedModel}_`));
        if (firstElement) {
            setSelectedElement(firstElement);
        }
    }
  }, [selectedModel, scoreboard]);

  useEffect(() => {
    if (scoreboard?.layout) {
      const style = scoreboard.layout[selectedElement];
      setCurrentStyle(style);
    }
    onElementSelect(selectedElement);
  }, [selectedElement, scoreboard, onElementSelect]);

  useEffect(() => {
    if (currentStyle) {
      setInputValues({
        x: String(currentStyle.x),
        y: String(currentStyle.y),
        width: String(currentStyle.width),
        height: String(currentStyle.height),
        fontSize: String(currentStyle.fontSize || 0),
      });
    }
  }, [currentStyle]);

  const handleStyleChange = (key: keyof VolleyballLayoutStyle, value: number) => {
    if (!currentStyle || isNaN(value)) return;
    const newStyle = { ...currentStyle, [key]: value };
    setCurrentStyle(newStyle);

    if (database) {
      const path = `volleyball/layout/${selectedElement}`;
      update(ref(database), { [path]: newStyle });
    }
  };

  const handleLocalInputChange = (key: keyof typeof inputValues, value: string) => {
    setInputValues(prev => ({ ...prev, [key]: value }));
  };

  const handleInputCommit = (key: keyof VolleyballLayoutStyle) => {
    const value = inputValues[key as keyof typeof inputValues];
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
      handleStyleChange(key, numericValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent, key: keyof VolleyballLayoutStyle) => {
    if (e.key === 'Enter') {
      handleInputCommit(key);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleVisibilityChange = (visible: boolean) => {
    if (!currentStyle || !database) return;
    const newStyle = { ...currentStyle, visible };
    setCurrentStyle(newStyle);

    const path = `volleyball/layout/${selectedElement}`;
    update(ref(database), { [path]: newStyle });
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

  const elementOptions = (Object.keys(scoreboard.layout) as Array<keyof VolleyballLayout>).filter(key => 
    key.startsWith(`model${selectedModel}_`)
  );

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Dynamic Volleyball Layout Editor</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="element-select">Select Element</Label>
            <Select value={selectedElement} onValueChange={(value) => setSelectedElement(value as keyof VolleyballLayout)}>
              <SelectTrigger id="element-select">
                <SelectValue placeholder="Select an element to edit" />
              </SelectTrigger>
              <SelectContent>
                {elementOptions.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label>Position X: {currentStyle.x}px</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[currentStyle.x]}
                max={1200}
                min={-200}
                step={1}
                onValueChange={(value) => handleStyleChange('x', value[0])}
              />
              <Input
                type="number"
                value={inputValues.x}
                onChange={(e) => handleLocalInputChange('x', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'x')}
                onBlur={() => handleInputCommit('x')}
                className="w-24"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Position Y: {currentStyle.y}px</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[currentStyle.y]}
                max={800}
                min={-200}
                step={1}
                onValueChange={(value) => handleStyleChange('y', value[0])}
              />
              <Input
                type="number"
                value={inputValues.y}
                onChange={(e) => handleLocalInputChange('y', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'y')}
                onBlur={() => handleInputCommit('y')}
                className="w-24"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Width: {currentStyle.width}px</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[currentStyle.width]}
                max={1200}
                step={1}
                onValueChange={(value) => handleStyleChange('width', value[0])}
              />
              <Input
                type="number"
                value={inputValues.width}
                onChange={(e) => handleLocalInputChange('width', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'width')}
                onBlur={() => handleInputCommit('width')}
                className="w-24"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Height: {currentStyle.height}px</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[currentStyle.height]}
                max={800}
                step={1}
                onValueChange={(value) => handleStyleChange('height', value[0])}
              />
              <Input
                type="number"
                value={inputValues.height}
                onChange={(e) => handleLocalInputChange('height', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'height')}
                onBlur={() => handleInputCommit('height')}
                className="w-24"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Font Size: {currentStyle.fontSize || 0}px</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[currentStyle.fontSize || 0]}
                max={200}
                step={1}
                onValueChange={(value) => handleStyleChange('fontSize', value[0])}
              />
              <Input
                type="number"
                value={inputValues.fontSize}
                onChange={(e) => handleLocalInputChange('fontSize', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'fontSize')}
                onBlur={() => handleInputCommit('fontSize')}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VolleyballLayoutEditor;
