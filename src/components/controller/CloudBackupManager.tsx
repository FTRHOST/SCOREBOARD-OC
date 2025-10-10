
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '@/firebase';
import { ref, onValue, set, remove, update, push, serverTimestamp } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Cloud, Save, Download, Trash2, Edit } from 'lucide-react';
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
import { Skeleton } from '../ui/skeleton';

interface Backup {
  id: string;
  name: string;
  timestamp: number;
  data: {
    scoreboard: any;
    volleyball: any;
  };
}

const CloudBackupManager = () => {
  const database = useDatabase();
  const { toast } = useToast();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBackupName, setNewBackupName] = useState('');
  const [editingBackup, setEditingBackup] = useState<Backup | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (!database) return;
    const backupsRef = ref(database, 'backups');
    const unsubscribe = onValue(backupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const backupList: Backup[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp);
        setBackups(backupList);
      } else {
        setBackups([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [database]);

  const handleSaveBackup = async () => {
    if (!database || !newBackupName.trim()) {
      toast({ title: "Backup name cannot be empty.", variant: "destructive" });
      return;
    }

    const scoreboardRef = ref(database, 'scoreboard');
    const volleyballRef = ref(database, 'volleyball');
    
    onValue(scoreboardRef, (scoreboardSnap) => {
        onValue(volleyballRef, async (volleyballSnap) => {
            const backupData = {
                scoreboard: scoreboardSnap.val(),
                volleyball: volleyballSnap.val(),
            };

            const backupsRef = ref(database, 'backups');
            const newBackupRef = push(backupsRef);

            await set(newBackupRef, {
                name: newBackupName,
                timestamp: serverTimestamp(),
                data: backupData,
            });

            toast({ title: `Backup "${newBackupName}" saved successfully!` });
            setNewBackupName('');

        }, { onlyOnce: true });
    }, { onlyOnce: true });
  };
  
  const handleLoadBackup = async (backup: Backup) => {
      if (!database) return;

      await set(ref(database, 'scoreboard'), backup.data.scoreboard);
      await set(ref(database, 'volleyball'), backup.data.volleyball);

      toast({ title: `Successfully loaded backup "${backup.name}"` });
      window.location.reload();
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!database) return;
    await remove(ref(database, `backups/${backupId}`));
    toast({ title: "Backup deleted successfully", variant: 'destructive' });
  };

  const handleRenameBackup = async () => {
    if (!database || !editingBackup || !editingName.trim()) return;

    await update(ref(database, `backups/${editingBackup.id}`), { name: editingName });
    toast({ title: "Backup renamed successfully" });
    setEditingBackup(null);
    setEditingName('');
  };
  
  const startEditing = (backup: Backup) => {
    setEditingBackup(backup);
    setEditingName(backup.name);
  };

  const cancelEditing = () => {
    setEditingBackup(null);
    setEditingName('');
  };


  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold font-headline text-center flex items-center justify-center">
            <Cloud className="mr-3 h-8 w-8" /> Cloud Backup Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-muted/20">
          <h4 className="font-semibold mb-2 flex items-center">
            <Save className="mr-2 h-5 w-5"/>
            Save Current Configuration
          </h4>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              placeholder="Enter backup name (e.g., Final Match)" 
              value={newBackupName}
              onChange={(e) => setNewBackupName(e.target.value)}
            />
            <Button onClick={handleSaveBackup} className="w-full sm:w-auto">Save to Cloud</Button>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-lg text-center">Saved Backups</h4>
          {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          ) : backups.length === 0 ? (
            <p className="text-muted-foreground text-center">No cloud backups found.</p>
          ) : (
            <ul className="space-y-2">
              {backups.map((backup) => (
                <li key={backup.id} className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-md border gap-2">
                   {editingBackup?.id === backup.id ? (
                        <div className="flex-grow flex gap-2 w-full">
                           <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                           <Button onClick={handleRenameBackup} size="sm">Save</Button>
                           <Button onClick={cancelEditing} variant="outline" size="sm">Cancel</Button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                           <p className="font-medium flex-grow">{backup.name}</p>
                           <p className="text-xs text-muted-foreground">{new Date(backup.timestamp).toLocaleString()}</p>
                        </div>
                    )}
                  
                  {editingBackup?.id !== backup.id && (
                     <div className="flex gap-2">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="secondary" size="sm"><Download className="mr-2 h-4 w-4"/>Load</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Load backup "{backup.name}"?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will overwrite all current data with the selected backup. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleLoadBackup(backup)}>Yes, Load Backup</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => startEditing(backup)}><Edit /></Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" className="h-9 w-9"><Trash2 /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete backup "{backup.name}"?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the backup from the cloud. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteBackup(backup.id)}>Yes, Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CloudBackupManager;
