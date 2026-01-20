"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, Download, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDatabase } from "@/firebase";
import { ref, onValue, set } from "firebase/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const TEAMS_PATH = 'teams';

export interface Team {
  name: string;
  type: 'futsal' | 'volleyball' | 'both';
}

const TeamManager = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamType, setNewTeamType] = useState<'futsal' | 'volleyball' | 'both'>('both');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const database = useDatabase();

  useEffect(() => {
    if (!database) return;

    const teamsRef = ref(database, TEAMS_PATH);
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let loadedTeams: Team[] = [];
        
        if (Array.isArray(data)) {
            // Handle legacy array of strings or new array of objects
            loadedTeams = data.map((item: any) => {
                if (typeof item === 'string') {
                    return { name: item, type: 'both' };
                }
                return item;
            });
        } else if (typeof data === 'object') {
             // Handle object map
             loadedTeams = Object.values(data).map((item: any) => {
                if (typeof item === 'string') {
                    return { name: item, type: 'both' };
                }
                return item;
             });
        }
        setTeams(loadedTeams);
      } else {
        setTeams([]);
      }
      setIsLoading(false);
    }, (error) => {
        console.error("Firebase read error:", error);
        toast({
            title: "Error",
            description: "Gagal memuat daftar tim dari database.",
            variant: "destructive",
        });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [database, toast]);

  const saveTeamsToFirebase = async (updatedTeams: Team[]) => {
    if (!database) return;
    try {
      const teamsRef = ref(database, TEAMS_PATH);
      await set(teamsRef, updatedTeams);
      toast({
        title: "Sukses",
        description: "Daftar tim berhasil disimpan.",
      });
    } catch (error) {
      console.error("Firebase write error:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan daftar tim.",
        variant: "destructive",
      });
    }
  };

  const addTeam = () => {
    if (newTeamName.trim() !== "") {
      const newTeam: Team = { name: newTeamName.trim(), type: newTeamType };
      const updatedTeams = [...teams, newTeam];
      saveTeamsToFirebase(updatedTeams);
      setNewTeamName("");
      setNewTeamType('both');
    }
  };

  const deleteTeam = (index: number) => {
    const updatedTeams = teams.filter((_, i) => i !== index);
    saveTeamsToFirebase(updatedTeams);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(teams.map(team => ({ 'Nama Tim': team.name, 'Tipe': team.type })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teams");
    XLSX.writeFile(workbook, "teams.xlsx");
    toast({
        title: "Sukses",
        description: "Daftar tim berhasil di-export ke teams.xlsx.",
    });
  };

  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);
            
            const importedTeams: Team[] = json.map(row => {
                const name = row['Nama Tim']?.toString().trim();
                const typeRaw = row['Tipe']?.toString().trim().toLowerCase();
                let type: 'futsal' | 'volleyball' | 'both' = 'both';
                if (typeRaw === 'futsal') type = 'futsal';
                if (typeRaw === 'volleyball' || typeRaw === 'voli') type = 'volleyball';
                
                return name ? { name, type } : null;
            }).filter(Boolean) as Team[];
            
            if (importedTeams.length === 0) {
                 toast({
                    title: "Info",
                    description: "Tidak ada tim yang ditemukan di file. Pastikan kolom header adalah 'Nama Tim' dan 'Tipe' (opsional).",
                    variant: "default",
                });
                return;
            }

            // Merge avoiding duplicates by name
            const currentNames = new Set(teams.map(t => t.name));
            const newUniqueTeams = importedTeams.filter(t => !currentNames.has(t.name));
            
            const updatedTeams = [...teams, ...newUniqueTeams];
            saveTeamsToFirebase(updatedTeams);
            toast({
                title: "Sukses",
                description: `${newUniqueTeams.length} tim baru berhasil di-import.`,
            });
        } catch(error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Gagal mengimpor file. Pastikan format file benar.",
                variant: "destructive",
            });
        }
      };
      reader.readAsArrayBuffer(file);
      event.target.value = '';
    }
  };

  const getTypeBadge = (type: string) => {
      switch(type) {
          case 'futsal': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Futsal</Badge>;
          case 'volleyball': return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">Voli</Badge>;
          default: return <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Semua</Badge>;
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
        <div className="flex-grow w-full">
            <Input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTeam()}
            placeholder="Nama Tim Baru"
            className="w-full"
            />
        </div>
        <div className="w-full sm:w-[150px]">
             <Select value={newTeamType} onValueChange={(v: any) => setNewTeamType(v)}>
                <SelectTrigger>
                    <SelectValue placeholder="Tipe" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="both">Semua</SelectItem>
                    <SelectItem value="futsal">Futsal</SelectItem>
                    <SelectItem value="volleyball">Voli</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Button onClick={addTeam} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={exportToExcel} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export (.xlsx)
        </Button>
        <div>
          <Button asChild variant="outline">
            <label htmlFor="import-excel" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" /> Import (.xlsx)
            </label>
          </Button>
          <Input
            id="import-excel"
            type="file"
            onChange={importFromExcel}
            className="hidden"
            accept=".xlsx, .xls"
          />
        </div>
      </div>
      
      <div className="border rounded-lg">
        <h2 className="text-xl font-bold p-4 border-b">Daftar Tim ({teams.length})</h2>
        {isLoading ? (
            <p className="p-4">Memuat...</p>
        ): teams.length > 0 ? (
            <ul className="divide-y max-h-[500px] overflow-y-auto">
                {teams.map((team, index) => (
                <li key={index} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="font-medium">{team.name}</span>
                        {getTypeBadge(team.type)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteTeam(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </li>
                ))}
            </ul>
        ) : (
            <p className="p-4 text-muted-foreground">Belum ada tim. Tambahkan tim baru atau import dari file.</p>
        )}
      </div>
    </div>
  );
};

export default TeamManager;