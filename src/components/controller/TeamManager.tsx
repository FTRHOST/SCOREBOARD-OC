"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, Download, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDatabase } from "@/firebase";
import { ref, onValue, set } from "firebase/database";

const TEAMS_PATH = 'teams';

const TeamManager = () => {
  const [teams, setTeams] = useState<string[]>([]);
  const [newTeam, setNewTeam] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const database = useDatabase();

  useEffect(() => {
    if (!database) return;

    const teamsRef = ref(database, TEAMS_PATH);
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (Array.isArray(data)) {
            setTeams(data);
        } else {
            // Handle case where data might not be an array (e.g. object with keys)
            setTeams(Object.values(data)); 
        }
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

  const saveTeamsToFirebase = async (updatedTeams: string[]) => {
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
    if (newTeam.trim() !== "") {
      const updatedTeams = [...teams, newTeam.trim()];
      saveTeamsToFirebase(updatedTeams);
      setNewTeam("");
    }
  };

  const deleteTeam = (index: number) => {
    const updatedTeams = teams.filter((_, i) => i !== index);
    saveTeamsToFirebase(updatedTeams);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(teams.map(team => ({ 'Nama Tim': team })));
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
            const importedTeams = json.map(row => row['Nama Tim']?.toString().trim()).filter(Boolean);
            
            if (importedTeams.length === 0) {
                 toast({
                    title: "Info",
                    description: "Tidak ada tim yang ditemukan di file. Pastikan kolom header adalah 'Nama Tim'.",
                    variant: "default",
                });
                return;
            }

            const updatedTeams = [...new Set([...teams, ...importedTeams])];
            saveTeamsToFirebase(updatedTeams);
            toast({
                title: "Sukses",
                description: `${importedTeams.length} tim berhasil di-import.`,
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
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          value={newTeam}
          onChange={(e) => setNewTeam(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTeam()}
          placeholder="Nama Tim Baru"
          className="flex-grow"
        />
        <Button onClick={addTeam}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Tim
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
            <ul className="divide-y">
                {teams.map((team, index) => (
                <li key={index} className="flex items-center justify-between p-4">
                    <span className="font-medium">{team}</span>
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
