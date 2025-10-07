"use client";

import { useState } from 'react';
import { useScoreboardData, updateScoreboard } from "@/hooks/useScoreboardData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Play, Pause, RotateCcw, Zap, Trash2, X } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function Controller() {
  const { scoreboard, loading } = useScoreboardData();
  const { toast } = useToast();
  const [timeInput, setTimeInput] = useState('20');
  const [halfInput, setHalfInput] = useState('First Half');

  if (loading) {
    return <div>Loading Controller...</div>;
  }

  if (!scoreboard) {
    return <div>Scoreboard data not found.</div>;
  }
  
  const {
    teamAName, teamBName, teamAScore, teamBScore, teamAFouls, teamBFouls, isRunning, logoSrc
  } = scoreboard;

  const handleUpdate = async (field: string, value: any) => {
    try {
      await updateScoreboard({ [field]: value });
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
    const newScore = Math.max(0, currentScore + delta);
    handleUpdate(team === 'A' ? 'teamAScore' : 'teamBScore', newScore);
  };
  
  const updateFouls = (team: 'A' | 'B') => {
    const currentFouls = team === 'A' ? teamAFouls : teamBFouls;
    handleUpdate(team === 'A' ? 'teamAFouls' : 'teamBFouls', currentFouls + 1);
  };

  const resetFouls = (team: 'A' | 'B') => {
    handleUpdate(team === 'A' ? 'teamAFouls' : 'teamBFouls', 0);
  };

  const handleTimeSet = () => {
    const minutes = parseInt(timeInput, 10);
    if (!isNaN(minutes) && minutes > 0) {
      handleUpdate('initialTime', minutes * 60);
      handleUpdate('time', minutes * 60);
      handleUpdate('isRunning', false);
    }
  };
  
  const resetTimer = () => {
    handleUpdate('time', scoreboard.initialTime);
    handleUpdate('isRunning', false);
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
          <h3 className="font-bold text-lg text-center" style={{ color: scoreboard.teamAColor }}>Team A</h3>
          <div className="space-y-2">
            <Label htmlFor="teamAName">Team Name</Label>
            <Input id="teamAName" value={teamAName} onChange={(e) => handleUpdate('teamAName', e.target.value)} />
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
              <Button size="icon" variant="destructive" onClick={() => updateFouls('A')}><Zap /></Button>
              <Button size="icon" variant="outline" onClick={() => resetFouls('A')}><Trash2 /></Button>
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
              <Input id="halfSet" value={halfInput} onChange={(e) => setHalfInput(e.target.value)} placeholder="e.g., Babak 1" />
              <Button onClick={() => handleUpdate('half', halfInput)}>Set</Button>
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
        </div>

        {/* Team B Controls */}
        <div className="flex flex-col gap-4 p-4 rounded-lg border bg-card">
          <h3 className="font-bold text-lg text-center" style={{ color: scoreboard.teamBColor }}>Team B</h3>
          <div className="space-y-2">
            <Label htmlFor="teamBName">Team Name</Label>
            <Input id="teamBName" value={teamBName} onChange={(e) => handleUpdate('teamBName', e.target.value)} />
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
              <Button size="icon" variant="destructive" onClick={() => updateFouls('B')}><Zap /></Button>
              <Button size="icon" variant="outline" onClick={() => resetFouls('B')}><Trash2 /></Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
