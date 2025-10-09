
'use client';

import { useDatabase } from '@/firebase';
import { ref, onValue, set } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, Trash2 } from 'lucide-react';
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

        // Add confirmation dialog for import
        // For simplicity, directly writing data. In a real app, use a modal.
        await set(ref(database), data);
        toast({ title: "Configuration imported successfully" });

      } catch (error) {
        console.error("Import failed:", error);
        toast({ title: "Import failed", description: "Please check the file format and content.", variant: "destructive" });
      } finally {
        // Reset file input
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
    try {
        await set(ref(database), {}); // This will delete all data at the root.
        toast({ title: "Database has been completely reset" });
         // Optional: reload the page to re-initialize default state from hooks
        window.location.reload();
    } catch (error) {
        console.error("Database reset failed:", error);
        toast({ title: "Database reset failed", variant: "destructive" });
    }
  };


  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Configuration Manager</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        This will permanently delete ALL data from the database, including futsal, volleyball, layouts, and logos. The application will be restored to its initial factory state. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetDatabase}>
                           Yes, delete everything
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
