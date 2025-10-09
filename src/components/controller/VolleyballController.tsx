
"use client";

import { useVolleyballData } from "@/hooks/useVolleyballData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, RotateCcw, Palette, RefreshCw, Award, Trash2 } from "lucide-react";
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

export default function VolleyballController() {
  const { scoreboard, loading, updateScoreboard, updatePoints, updateSets, winSet, resetSet, resetMatch, swapTeams } = useVolleyballData();

  if (loading || !scoreboard) {
    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
            <CardHeader><CardTitle>Loading Controller...</CardTitle></CardHeader>
        </Card>
    );
  }

  const { teamAName, teamBName, teamASets, teamBSets, teamAPoints, teamBPoints, matchTitle, teamAColor, teamBColor } = scoreboard;

  const handleUpdate = (field: string, value: any) => {
    updateScoreboard({ [field]: value });
  };
  
  const TeamControls = ({ team, name, sets, points, color }: { team: 'A' | 'B', name: string, sets: number, points: number, color: string }) => (
    <div className="flex-shrink-0 w-[300px] md:w-auto flex flex-col gap-4 p-4 rounded-lg border bg-card">
      <h3 className="font-bold text-lg text-center" style={{ color: color }}>{team === 'A' ? 'Tim A' : 'Tim B'}</h3>
      <div className="space-y-2">
        <Label htmlFor={`team${team}Name`}>Nama Tim</Label>
        <Input id={`team${team}Name`} value={name || ''} onChange={(e) => handleUpdate(`team${team}Name`, e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Set Dimenangkan</Label>
          <div className="flex items-center gap-2">
            <Button size="icon" onClick={() => updateSets(team, -1)} variant="outline"><Minus /></Button>
            <Input value={sets} className="text-center font-bold" readOnly />
            <Button size="icon" onClick={() => updateSets(team, 1)}><Plus /></Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Poin Saat Ini</Label>
          <div className="flex items-center gap-2">
            <Button size="icon" onClick={() => updatePoints(team, -1)} variant="outline"><Minus /></Button>
            <Input value={points} className="text-center font-bold" readOnly />
            <Button size="icon" onClick={() => updatePoints(team, 1)}><Plus /></Button>
          </div>
        </div>
      </div>
       <div className="space-y-2">
        <Label htmlFor={`team${team}Color`} className="flex items-center gap-2"><Palette/> Warna Tim</Label>
        <div 
          className="w-full h-8 rounded-md border" 
          style={{ backgroundColor: color }}
        />
        <Input 
          id={`team${team}Color`} 
          type="text" 
          value={color}
          onChange={(e) => handleUpdate(team === 'A' ? 'teamAColor' : 'teamBColor', e.target.value)}
          placeholder="#RRGGBB"
        />
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center font-headline">
          Master Kontroler Bola Voli
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        <div className="flex gap-4 pb-4 md:pb-0 md:grid md:grid-cols-3 md:gap-6 w-full overflow-x-auto md:overflow-visible p-4 md:p-0">
          
          <TeamControls team="A" name={teamAName} sets={teamASets} points={teamAPoints} color={teamAColor} />

          {/* General Controls */}
          <div className="flex-shrink-0 w-[300px] md:w-auto flex flex-col gap-4 p-4 rounded-lg border bg-card">
            <h3 className="font-bold text-lg text-center">Kontrol Pertandingan</h3>
            <div className="space-y-2">
              <Label htmlFor="matchTitle">Judul Pertandingan</Label>
              <Input id="matchTitle" value={matchTitle} onChange={(e) => handleUpdate('matchTitle', e.target.value)} placeholder="e.g., FINAL" />
            </div>
            
            <Separator />
            
            <div className='flex flex-col gap-2'>
              <Label>Aksi Set</Label>
               <div className="flex flex-wrap gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => winSet('A')}>
                    <Award className="mr-2 h-4 w-4" /> Tim A Menang Set
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => winSet('B')}>
                    <Award className="mr-2 h-4 w-4" /> Tim B Menang Set
                </Button>
                <Button variant="destructive" className="w-full" onClick={resetSet}>
                    <Trash2 className="mr-2 h-4 w-4" /> Reset Poin Set Ini
                </Button>
              </div>
            </div>

            <Separator />

            <div className='flex flex-col gap-2'>
              <Label>Aksi Pertandingan</Label>
              <div className="flex flex-wrap gap-2 w-full">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <RefreshCw className="mr-2 h-4 w-4" /> Tukar Tim
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anda yakin ingin menukar tim?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ini akan menukar nama, set, poin, dan warna antara Tim A dan Tim B.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={swapTeams}>Konfirmasi Tukar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <RotateCcw className="mr-2 h-4 w-4" /> Reset Semua
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anda yakin ingin mereset semuanya?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ini akan mereset semua set dan poin ke 0. Nama tim, warna, dan logo tidak akan berubah.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={resetMatch}>Konfirmasi Reset</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
          
          <TeamControls team="B" name={teamBName} sets={teamBSets} points={teamBPoints} color={teamBColor} />

        </div>
      </CardContent>
    </Card>
  );
}
