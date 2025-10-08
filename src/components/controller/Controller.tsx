
"use client";

import { useState } from 'react';
import { useScoreboardData } from "@/hooks/useScoreboardData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Play, Pause, RotateCcw, Zap, Trash2, X, Palette, RefreshCw } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Controller() {
  const { scoreboard, loading, updateScoreboard, resetScoreboard, swapTeams, addColorSuggestion, deleteColorSuggestion } = useScoreboardData();
  const { toast } = useToast();
  const [timeInput, setTimeInput] = useState('20');
  const [newColorSuggestion, setNewColorSuggestion] = useState('');

  if (loading) {
    return <div>Loading Controller...</div>;
  }
  
  if (!scoreboard) {
    return <div>Scoreboard data not available.</div>;
  }

  const {
    teamAName, teamBName, teamAScore, teamBScore, teamAFouls, teamBFouls, isRunning, logoSrc, half, teamAColor, teamBColor, colorSuggestions
  } = scoreboard;

  const handleUpdate = (field: string, value: any) => {
    try {
      updateScoreboard({ [field]: value });
    } catch (error) {
      console.error("Failed to update scoreboard:", error);
      toast({
        title: "Error",
        description: "Failed to update scoreboard. Please check console for details.",
        variant: "destructive",
      });
    }
  };

  const updateScore = (team: 'A' | 'B', delta: number) => {
    const currentScore = team === 'A' ? teamAScore : teamBScore;
    const newScore = Math.max(0, (currentScore || 0) + delta);
    handleUpdate(team === 'A' ? 'teamAScore' : 'teamBScore', newScore);
  };
  
  const updateFouls = (team: 'A' | 'B', delta: number) => {
    const currentFouls = team === 'A' ? teamAFouls : teamBFouls;
    const newFouls = Math.max(0, (currentFouls || 0) + delta);
    handleUpdate(team === 'A' ? 'teamAFouls' : 'teamBFouls', newFouls);
  };

  const resetFouls = (team: 'A' | 'B') => {
    handleUpdate(team === 'A' ? 'teamAFouls' : 'teamBFouls', 0);
  };

  const handleTimeSet = () => {
    const minutes = parseInt(timeInput, 10);
    if (!isNaN(minutes) && minutes >= 0) {
      handleUpdate('initialTime', minutes * 60);
      handleUpdate('time', minutes * 60);
      handleUpdate('isRunning', false);
    }
  };
  
  const resetTimer = () => {
    if (scoreboard) {
      handleUpdate('time', scoreboard.initialTime);
      handleUpdate('isRunning', false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleUpdate('logoSrc', result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSwapTeams = () => {
    if (window.confirm('Are you sure you want to swap the teams? This will swap names, scores, fouls, and colors.')) {
        swapTeams();
    }
  };

  const handleAddColor = () => {
    if (newColorSuggestion.match(/^#[0-9a-fA-F]{6}$/)) {
      addColorSuggestion(newColorSuggestion);
      setNewColorSuggestion('');
    } else {
      toast({
        title: "Invalid Color",
        description: "Please enter a valid hex color code (e.g., #RRGGBB).",
        variant: "destructive",
      });
    }
  };

  const ColorSuggestion = ({ team }: { team: 'A' | 'B' }) => (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex flex-wrap gap-2">
        {colorSuggestions?.map((color) => (
          <div key={color} className="relative group">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8"
              style={{ backgroundColor: color }}
              onClick={() => handleUpdate(team === 'A' ? 'teamAColor' : 'teamBColor', color)}
            />
             <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteColorSuggestion(color)}
              >
                <X className="h-3 w-3" />
              </Button>
          </div>
        ))}
      </div>
       <div className="flex gap-2 items-center">
          <Input 
            type="text" 
            value={newColorSuggestion} 
            onChange={(e) => setNewColorSuggestion(e.target.value)} 
            placeholder="#RRGGBB"
            className="w-28"
          />
          <Button onClick={handleAddColor} size="sm">Add</Button>
        </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center font-headline">
          Master Controller
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team A Controls */}
        <div className="flex flex-col gap-4 p-4 rounded-lg border bg-card">
          <h3 className="font-bold text-lg text-center" style={{ color: teamAColor }}>Team A</h3>
          <div className="space-y-2">
            <Label htmlFor="teamAName">Team Name</Label>
            <Input id="teamAName" value={teamAName || ''} onChange={(e) => handleUpdate('teamAName', e.target.value)} />
          </div>
           <div className="space-y-2">
              <Label htmlFor="teamAColor" className="flex items-center gap-2"><Palette/> Team Color</Label>
              <Input id="teamAColor" type="color" value={teamAColor || '#B72FCE'} onChange={(e) => handleUpdate('teamAColor', e.target.value)} className="h-10 p-1" />
               <ColorSuggestion team="A" />
            </div>
          <div className="space-y-2">
            <Label>Score</Label>
            <div className="flex gap-2">
              <Button size="icon" onClick={() => updateScore('A', 1)}><Plus /></Button>
              <Button size="icon" variant="outline" onClick={() => updateScore('A', -1)}><Minus /></Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fouls</Label>
            <div className="flex gap-2">
              <Button size="icon" onClick={() => updateFouls('A', 1)}><Plus /></Button>
              <Button size="icon" variant="outline" onClick={() => updateFouls('A', -1)}><Minus /></Button>
              <Button size="icon" variant="destructive" onClick={() => resetFouls('A')}><Trash2 /></Button>
            </div>
          </div>
        </div>

        {/* General Controls */}
        <div className="flex flex-col gap-4 p-4 rounded-lg border bg-card">
          <h3 className="font-bold text-lg text-center">Match Controls</h3>
          <div className="space-y-2">
            <Label htmlFor="timerSet">Set Timer (minutes)</Label>
            <div className="flex gap-2">
              <Input id="timerSet" type="number" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} placeholder="e.g., 20" />
              <Button onClick={handleTimeSet}>Set</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Timer</Label>
            <div className="flex gap-2">
              {isRunning ? (
                <Button className="flex-1" variant="destructive" onClick={() => handleUpdate('isRunning', false)}><Pause className="mr-2" /> Pause</Button>
              ) : (
                <Button className="flex-1" onClick={() => handleUpdate('isRunning', true)}><Play className="mr-2" /> Start</Button>
              )}
              <Button size="icon" variant="outline" onClick={resetTimer}><RotateCcw /></Button>
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="halfSet">Set Half Text</Label>
            <div className="flex gap-2">
              <Input id="halfSet" value={half} onChange={(e) => handleUpdate('half', e.target.value)} placeholder="e.g., Babak 1" />
            </div>
          </div>
          <Separator />
           <div className="space-y-2">
            <Label htmlFor="logoUpload">Upload Logo</Label>
            <Input id="logoUpload" type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
            {logoSrc && (
                <Button variant="outline" size="sm" onClick={() => handleUpdate('logoSrc', null)}>
                    <X className="mr-2 h-4 w-4" /> Remove Logo
                </Button>
            )}
          </div>
          <Separator />
          <div className='flex flex-col gap-2'>
            <Label>Actions</Label>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleSwapTeams} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" /> Swap Teams
                </Button>
                 <Button variant="destructive" onClick={resetScoreboard}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset All
                </Button>
            </div>
          </div>
        </div>

        {/* Team B Controls */}
        <div className="flex flex-col gap-4 p-4 rounded-lg border bg-card">
          <h3 className="font-bold text-lg text-center" style={{ color: teamBColor }}>Team B</h3>
          <div className="space-y-2">
            <Label htmlFor="teamBName">Team Name</Label>
            <Input id="teamBName" value={teamBName || ''} onChange={(e) => handleUpdate('teamBName', e.target.value)} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="teamBColor" className="flex items-center gap-2"><Palette/> Team Color</Label>
              <Input id="teamBColor" type="color" value={teamBColor || '#EF7438'} onChange={(e) => handleUpdate('teamBColor', e.target.value)} className="h-10 p-1" />
              <ColorSuggestion team="B" />
          </div>
          <div className="space-y-2">
            <Label>Score</Label>
            <div className="flex gap-2">
              <Button size="icon" onClick={() => updateScore('B', 1)}><Plus /></Button>
              <Button size="icon" variant="outline" onClick={() => updateScore('B', -1)}><Minus /></Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fouls</Label>
            <div className="flex gap-2">
              <Button size="icon" onClick={() => updateFouls('B', 1)}><Plus /></Button>
              <Button size="icon" variant="outline" onClick={() => updateFouls('B', -1)}><Minus /></Button>
              <Button size="icon" variant="destructive" onClick={() => resetFouls('B')}><Trash2 /></Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
