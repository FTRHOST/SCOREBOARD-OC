
'use client';

import { useDatabase } from '@/firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { useCallback, useRef } from 'react';
import { defaultLayout } from '@/hooks/useScoreboardData';
import { defaultVolleyballLayout } from '@/hooks/useVolleyballData';

const ConfigManager = () => {
  const database = useDatabase();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(async () => {
    if (!database) {
      toast({ title: "Database not connected", variant: "destructive" });
      return;
    }
    const dbRef = ref(database);
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scoreboard_backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Configuration exported successfully" });
      } else {
        toast({ title: "No data to export", variant: "destructive" });
      }
    }, { onlyOnce: true });
  }, [database, toast]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!database) {
          toast({ title: "Database not connected", variant: "destructive" });
          return;
        }

        await set(ref(database), data);
        toast({ title: "Configuration imported successfully" });

      } catch (error) {
        console.error("Import failed:", error);
        toast({ title: "Import failed", description: "Please check the file format and content.", variant: "destructive" });
      } finally {
        if(fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  }, [database, toast]);
  
  const handleResetDatabase = async () => {
    if (!database) {
      toast({ title: "Database not connected", variant: "destructive" });
      return;
    }
    const defaultDatabaseState = {
  "scoreboard": {
    "colorSuggestions": [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#EF7438",
      "#B72FCE"
    ],
    "eventTitle": "OSIS CUP 2025",
    "half": "Babak 1",
    "initialTime": 900,
    "isRunning": false,
    "layout": {
      "model1_half": {
        "fontSize": 42,
        "height": 48,
        "visible": true,
        "width": 233,
        "x": 405,
        "y": 165
      },
      "model1_logo": {
        "height": 188,
        "visible": true,
        "width": 238,
        "x": 412,
        "y": -10
      },
      "model1_teamAName": {
        "fontSize": 88,
        "height": 105,
        "visible": true,
        "width": 320,
        "x": 0,
        "y": 41
      },
      "model1_teamAScore": {
        "fontSize": 92,
        "height": 105,
        "visible": true,
        "width": 85,
        "x": 331,
        "y": 41
      },
      "model1_teamBScore": {
        "fontSize": 92,
        "height": 105,
        "visible": true,
        "width": 106,
        "x": 625,
        "y": 41
      },
      "model2_teamAName": {
        "fontSize": 82,
        "height": 105,
        "visible": true,
        "width": 320,
        "x": 0,
        "y": 41
      },
      "model2_teamAScore": {
        "fontSize": 96,
        "height": 105,
        "visible": true,
        "width": 160,
        "x": 290,
        "y": 41
      },
      "model2_teamBScore": {
        "fontSize": 96,
        "height": 105,
        "visible": true,
        "width": 144,
        "x": 593,
        "y": 41
      }
    },
    "pauseTime": 900,
    "startTime": 1760059901502,
    "teamAColor": "#EF7438",
    "teamAFouls": 0,
    "teamAName": "10.1",
    "teamAScore": 0,
    "teamBColor": "#B72FCE",
    "teamBFouls": 0,
    "teamBName": "10.2",
    "teamBScore": 0,
    "time": 900
  },
  "volleyball": {
    "currentSet": 1,
    "layout": {
      "model1_matchTitleBox": {
        "fontSize": 0,
        "height": 48,
        "visible": true,
        "width": 296,
        "x": 379,
        "y": 178
      },
      "model1_matchTitleText": {
        "fontSize": 42,
        "height": 48,
        "visible": true,
        "width": 297,
        "x": 379,
        "y": 178
      },
      "model1_teamAPoints": {
        "fontSize": 96,
        "height": 96,
        "visible": true,
        "width": 126,
        "x": 313,
        "y": 41
      },
      "model1_teamASetScoreText": {
        "fontSize": 64,
        "height": 64,
        "visible": true,
        "width": 95,
        "x": 112,
        "y": 159
      },
      "model1_teamASets": {
        "fontSize": 96,
        "height": 96,
        "visible": true,
        "width": 96,
        "x": 333,
        "y": 41
      },
      "model1_teamBPoints": {
        "fontSize": 96,
        "height": 96,
        "visible": true,
        "width": 120,
        "x": 615,
        "y": 40
      },
      "model1_teamBSets": {
        "fontSize": 96,
        "height": 96,
        "visible": true,
        "width": 96,
        "x": 622,
        "y": 41
      },
      "model2_matchTitleBox": {
        "width": 296,
        "x": 379
      },
      "model2_matchTitleText": {
        "fontSize": 37,
        "width": 297,
        "x": 378
      },
      "model2_teamASet1Score": {
        "fontSize": 72,
        "height": 96,
        "visible": true,
        "width": 112,
        "x": -6,
        "y": 156
      },
      "model2_teamASet2Score": {
        "fontSize": 72,
        "height": 517,
        "visible": true,
        "width": 127,
        "x": 95,
        "y": -59
      },
      "model2_teamASet3Score": {
        "fontSize": 72,
        "height": 96,
        "visible": true,
        "width": 130,
        "x": 203,
        "y": 153
      },
      "model2_teamASetHistoryBox": {
        "fontSize": 0,
        "height": 112,
        "visible": true,
        "width": 320,
        "x": -6,
        "y": 146
      },
      "model2_teamASets": {
        "fontSize": 96,
        "height": 96,
        "visible": true,
        "width": 96,
        "x": 327,
        "y": 39
      },
      "model2_teamBSet1Score": {
        "fontSize": 72,
        "height": 96,
        "visible": true,
        "width": 118,
        "x": 723,
        "y": 158
      },
      "model2_teamBSet2Score": {
        "fontSize": 72,
        "height": 96,
        "visible": true,
        "width": 144,
        "x": 818,
        "y": 158
      },
      "model2_teamBSet3Score": {
        "fontSize": 72,
        "height": 96,
        "visible": true,
        "width": 133,
        "x": 931,
        "y": 154
      },
      "model2_teamBSetHistoryBox": {
        "fontSize": 0,
        "height": 112,
        "visible": true,
        "width": 320,
        "x": 726,
        "y": 146
      },
      "model2_teamBSets": {
        "fontSize": 96,
        "height": 96,
        "visible": true,
        "width": 96,
        "x": 625,
        "y": 38
      },
      "model3_matchTitleBox": {
        "fontSize": 0,
        "height": 48,
        "visible": true,
        "width": 655,
        "x": 0,
        "y": 164
      },
      "model3_teamASetHistoryBox": {
        "fontSize": 0,
        "height": 80,
        "visible": true,
        "width": 288,
        "x": 385,
        "y": 12
      },
      "model3_teamBSetBox": {
        "fontSize": 0,
        "height": 64,
        "visible": true,
        "width": 80,
        "x": 321,
        "y": 90
      },
      "model3_teamBSetHistoryBox": {
        "fontSize": 0,
        "height": 80,
        "visible": true,
        "width": 288,
        "x": 385,
        "y": 83
      },
      "model3_teamBSetsText": {
        "fontSize": 72,
        "height": 64,
        "visible": true,
        "width": 80,
        "x": 321,
        "y": 88
      }
    },
    "logoSrc": "https://placehold.co/238x188",
    "matchTitle": "SEMI FINAL",
    "setHistory": [
      {
        "teamAScore": 0,
        "teamBScore": 0
      },
      {
        "teamAScore": 0,
        "teamBScore": 0
      },
      {
        "teamAScore": 0,
        "teamBScore": 0
      },
      {
        "teamAScore": 0,
        "teamBScore": 0
      },
      {
        "teamAScore": 0,
        "teamBScore": 0
      }
    ],
    "teamAColor": "#F97316",
    "teamAName": "10.2",
    "teamAPoints": 0,
    "teamASets": 0,
    "teamBColor": "#B72FCE",
    "teamBName": "10.3",
    "teamBPoints": 0,
    "teamBSets": 0
  }
};
    
    try {
        await set(ref(database), defaultDatabaseState);
        toast({ title: "Database has been completely reset to your default configuration." });
        window.location.reload();
    } catch (error) {
        console.error("Database reset failed:", error);
        toast({ title: "Database reset failed", variant: "destructive" });
    }
  };
  
  const handleResetLayouts = async () => {
    if (!database) {
      toast({ title: "Database not connected", variant: "destructive" });
      return;
    }
    try {
      const updates: { [key: string]: any } = {};
      updates['/scoreboard/layout'] = defaultLayout;
      updates['/volleyball/layout'] = defaultVolleyballLayout;
      
      await update(ref(database), updates);

      toast({ title: "All layouts have been reset to default" });
      window.location.reload();

    } catch (error) {
      console.error("Layout reset failed:", error);
      toast({ title: "Layout reset failed", variant: "destructive" });
    }
  }


  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Configuration Manager</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label>Export Configuration</Label>
            <Button onClick={handleExport} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Backup to File
            </Button>
        </div>
        <div className="space-y-2">
            <Label htmlFor="import-file">Import Configuration</Label>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        Restore from File
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will overwrite all current scoreboard data and layouts with the content from the backup file. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => fileInputRef.current?.click()}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Input 
              id="import-file" 
              type="file" 
              className="hidden" 
              accept=".json"
              onChange={handleImport}
              ref={fileInputRef}
            />
        </div>
        <div className="space-y-2">
            <Label>Reset Layouts</Label>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset All Layouts
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will reset ALL futsal and volleyball layout positions, sizes, and visibility to their default factory settings. Other data like scores and team names will not be affected.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetLayouts} className="bg-yellow-500 hover:bg-yellow-600">
                           Yes, reset layouts
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
         <div className="space-y-2">
            <Label>Reset Database</Label>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Reset All Data
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>DANGER: Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete ALL data and replace it with your custom default configuration. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetDatabase}>
                           Yes, delete and reset
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigManager;

    