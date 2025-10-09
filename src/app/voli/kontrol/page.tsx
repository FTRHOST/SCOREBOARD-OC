
"use client";

import { useState, useEffect } from "react";
import VolleyballController from "@/components/controller/VolleyballController";
import ScoreboardVoli1 from "@/components/scoreboards/volleyball/ScoreboardVoli1";
import ScoreboardVoli2 from "@/components/scoreboards/volleyball/ScoreboardVoli2";
import ScoreboardVoli3 from "@/components/scoreboards/volleyball/ScoreboardVoli3";
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
import { ExternalLink, ZoomIn, ZoomOut, RotateCcw, Home } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import VolleyballLayoutEditor from "@/components/controller/VolleyballLayoutEditor";
import ConfigManager from "@/components/controller/ConfigManager";


export default function VolleyballControllerPage() {
  const [selectedScoreboard, setSelectedScoreboard] = useState("1");
  const [zoomLevel, setZoomLevel] = useState(100);
  const isMobile = useIsMobile();
  const [selectedLayoutElement, setSelectedLayoutElement] = useState<any | null>(null);

  useEffect(() => {
    setZoomLevel(isMobile ? 30 : 85);
  }, [isMobile]);

  const renderScoreboard = () => {
    const props = { selectedLayoutElement };
    switch (selectedScoreboard) {
      case "1":
        return <div className="w-[1048px] h-[224px]"><ScoreboardVoli1 {...props} /></div>;
      case "2":
        return <div className="w-[1049px] h-[256px]"><ScoreboardVoli2 {...props} /></div>;
      case "3":
        return <div className="w-[673px] h-[208px]"><ScoreboardVoli3 {...props} /></div>;
      default:
        return <div className="w-[1048px] h-[224px]"><ScoreboardVoli1 {...props} /></div>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
       <header className="flex justify-start items-center mb-4">
        <Link href="/" passHref>
            <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Home
            </Button>
        </Link>
      </header>
      <main className="flex flex-col gap-8 items-center">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
               <CardTitle className="text-2xl font-bold font-headline">
                Pratinjau Papan Skor Voli
               </CardTitle>
                <Link href={`/voli/${selectedScoreboard}`} target="_blank" passHref>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Buka di Tab Baru
                    </Button>
                </Link>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <Select value={selectedScoreboard} onValueChange={setSelectedScoreboard}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih model papan skor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Papan Skor Model 1</SelectItem>
                  <SelectItem value="2">Papan Skor Model 2</SelectItem>
                  <SelectItem value="3">Papan Skor Model 3</SelectItem>
                </SelectContent>
              </Select>

               <div className="flex flex-col gap-2">
                  <Label htmlFor="zoom-slider" className="text-sm font-medium">
                    Kontrol Zoom
                  </Label>
                  <div className="flex items-center gap-2">
                    <ZoomOut />
                    <Slider
                      id="zoom-slider"
                      min={10}
                      max={150}
                      step={5}
                      value={[zoomLevel]}
                      onValueChange={(value) => setZoomLevel(value[0])}
                    />
                    <ZoomIn />
                    <span className="text-sm font-medium w-16 text-center">{zoomLevel}%</span>
                    <Button variant="outline" size="icon" onClick={() => setZoomLevel(isMobile ? 30 : 85)} className="h-8 w-8">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
              </div>
            </div>
            
            <div className="w-full aspect-video p-4 bg-muted/30 rounded-lg flex items-center justify-center overflow-hidden">
              <div 
                className="transition-transform duration-300 ease-in-out relative"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                }}
              >
                  {renderScoreboard()}
              </div>
            </div>
          </CardContent>
        </Card>

        <VolleyballController />
        
        <VolleyballLayoutEditor onElementSelect={setSelectedLayoutElement} />

        <ConfigManager />
        
      </main>
    </div>
  );
}
