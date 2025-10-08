
"use client";

import { useState } from "react";
import Controller from "@/components/controller/Controller";
import Scoreboard1 from "@/components/scoreboards/Scoreboard1";
import Scoreboard2 from "@/components/scoreboards/Scoreboard2";
import Scoreboard3 from "@/components/scoreboards/Scoreboard3";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function ControllerPage() {
  const [selectedScoreboard, setSelectedScoreboard] = useState("1");
  const [zoomLevel, setZoomLevel] = useState(1);

  const renderScoreboard = () => {
    switch (selectedScoreboard) {
      case "1":
        return <Scoreboard1 />;
      case "2":
        return <Scoreboard2 />;
      case "3":
        return <Scoreboard3 />;
      default:
        return <Scoreboard1 />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline">
          Futsal Scoreboard Pro
        </h1>
        <p className="text-muted-foreground mt-2">
          Central controller for all your futsal match needs.
        </p>
      </header>

      <main className="flex flex-col gap-8 items-center">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
               <CardTitle className="text-2xl font-bold font-headline">
                Scoreboard Preview
               </CardTitle>
                <Link href={`/futsal/${selectedScoreboard}`} target="_blank" passHref>
                    <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in New Tab
                    </Button>
                </Link>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <Select value={selectedScoreboard} onValueChange={setSelectedScoreboard}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scoreboard model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Scoreboard Model 1</SelectItem>
                    <SelectItem value="2">Scoreboard Model 2</SelectItem>
                    <SelectItem value="3">Scoreboard Model 3</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <ZoomOut className="h-5 w-5" />
                  <Slider
                    value={[zoomLevel]}
                    onValueChange={(value) => setZoomLevel(value[0])}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                  />
                  <ZoomIn className="h-5 w-5" />
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(1)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
            </div>

            <div className="w-full p-4 bg-muted/30 rounded-lg flex items-center justify-center overflow-auto min-h-[300px]">
                <div 
                  className="transform transition-transform duration-300"
                  style={{ scale: zoomLevel }}
                >
                    {renderScoreboard()}
                </div>
            </div>
          </CardContent>
        </Card>

        <Controller />
      </main>
    </div>
  );
}

    