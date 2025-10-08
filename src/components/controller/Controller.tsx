
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function Controller() {
  const { scoreboard, loading, updateScoreboard, resetScoreboard, swapTeams, addColorSuggestion, deleteColorSuggestion } = useScoreboardData();
  const { toast } = useToast();
  const [timeInput, setTimeInput] = useState('20');

  if (loading) {
    return <div>Loading Controller...</div>;
  }
  
  if (!scoreboard) {
    return <div>Scoreboard data not available.</div>;
  }

  const {
    teamAName, teamBName, teamAScore, teamBScore, teamAFouls, teamBFouls, isRunning, half, teamAColor, teamBColor, colorSuggestions
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

  const handleSwapTeams = () => {
    swapTeams();
  };
  
  const CustomColorPopover = ({ onColorChange }: { onColorChange: (newColor: string) => void }) => {
    const [customColor, setCustomColor] = useState('#FFFFFF');

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="w-8 h-8">
            <Plus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-24"
              placeholder="#RRGGBB"
            />
            <Button onClick={() => addColorSuggestion(customColor)} size="sm">Set</Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const ColorControls = ({ team }: { team: 'A' | 'B' }) => (
    <div className="space-y-2">
        <Label htmlFor={`team${team}Color`} className="flex items-center gap-2"><Palette/> Team Color</Label>
        <div 
          className="w-full h-10 rounded-md border" 
          style={{ backgroundColor: team === 'A' ? teamAColor : teamBColor }}
        />

        <div className="flex flex-wrap items-center gap-2">
          {colorSuggestions?.map((color) => (
            <div key={color} className="relative group">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full"
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
          <CustomColorPopover onColorChange={(newColor) => addColorSuggestion(newColor)} />
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
      <CardContent className="p-0 md:p-6">
        <div className="flex gap-4 pb-4 md:pb-0 md:grid md:grid-cols-3 md:gap-6 w-full overflow-x-auto md:overflow-visible p-4 md:p-0">
          {/* Team A Controls */}
          <div className="flex-shrink-0 w-[300px] md:w-auto flex flex-col gap-4 p-4 rounded-lg border bg-card">
            <h3 className="font-bold text-lg text-center" style={{ color: teamAColor }}>Team A</h3>
            <div className="space-y-2">
              <Label htmlFor="teamAName">Team Name</Label>
              <Input id="teamAName" value={teamAName || ''} onChange={(e) => handleUpdate('teamAName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Score</Label>
              <div className="flex items-center gap-2">
                <Button size="icon" onClick={() => updateScore('A', -1)} variant="outline"><Minus /></Button>
                <Input value={teamAScore} className="text-center font-bold" readOnly />
                <Button size="icon" onClick={() => updateScore('A', 1)}><Plus /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fouls</Label>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => updateFouls('A', -1)}><Minus /></Button>
                <Input value={teamAFouls} className="text-center font-bold w-12" readOnly />
                <Button size="icon" onClick={() => updateFouls('A', 1)}><Plus /></Button>
                <div className="flex-grow" />
                <Button size="icon" variant="destructive" onClick={() => resetFouls('A')}><Trash2 /></Button>
              </div>
            </div>
            <ColorControls team="A" />
          </div>

          {/* General Controls */}
          <div className="flex-shrink-0 w-[300px] md:w-auto flex flex-col gap-4 p-4 rounded-lg border bg-card">
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
            <div className='flex flex-col gap-2'>
              <Label>Actions</Label>
              <div className="flex gap-2 w-full">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <RefreshCw className="mr-2 h-4 w-4" /> Swap Teams
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to swap teams?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will swap the names, scores, fouls, and colors between Team A and Team B.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSwapTeams}>Confirm Swap</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <RotateCcw className="mr-2 h-4 w-4" /> Reset All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to reset everything?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset scores, fouls, and the timer. Team names, colors, and the logo will not be changed. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={resetScoreboard}>Confirm Reset</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Team B Controls */}
          <div className="flex-shrink-0 w-[300px] md:w-auto flex flex-col gap-4 p-4 rounded-lg border bg-card">
            <h3 className="font-bold text-lg text-center" style={{ color: teamBColor }}>Team B</h3>
            <div className="space-y-2">
              <Label htmlFor="teamBName">Team Name</Label>
              <Input id="teamBName" value={teamBName || ''} onChange={(e) => handleUpdate('teamBName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Score</Label>
              <div className="flex items-center gap-2">
                <Button size="icon" onClick={() => updateScore('B', -1)} variant="outline"><Minus /></Button>
                <Input value={teamBScore} className="text-center font-bold" readOnly />
                <Button size="icon" onClick={() => updateScore('B', 1)}><Plus /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fouls</Label>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => updateFouls('B', -1)}><Minus /></Button>
                <Input value={teamBFouls} className="text-center font-bold w-12" readOnly />
                <Button size="icon" onClick={() => updateFouls('B', 1)}><Plus /></Button>
                <div className="flex-grow" />
                <Button size="icon" variant="destructive" onClick={() => resetFouls('B')}><Trash2 /></Button>
              </div>
            </div>
            <ColorControls team="B" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    