"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface Team {
  name: string;
  type: 'futsal' | 'volleyball' | 'both';
}

interface TeamSelectorProps {
  teams: Team[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onCustomInput?: (value: string) => void;
}

export function TeamSelector({ teams, value, onChange, placeholder = "Pilih Tim...", onCustomInput }: TeamSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <div className="p-2">
            <Input 
                placeholder="Cari tim..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
            />
            <div className="max-h-[200px] overflow-y-auto space-y-1">
                {filteredTeams.length === 0 && (
                    <div className="py-2 text-center text-sm text-muted-foreground">
                        Tim tidak ditemukan.
                        {onCustomInput && searchTerm && (
                            <Button 
                                variant="link" 
                                size="sm" 
                                className="block mx-auto mt-1 h-auto p-0"
                                onClick={() => {
                                    onCustomInput(searchTerm);
                                    setOpen(false);
                                }}
                            >
                                Gunakan "{searchTerm}"
                            </Button>
                        )}
                    </div>
                )}
                {filteredTeams.map((team) => (
                    <div
                        key={team.name}
                        className={cn(
                            "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                            value === team.name && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => handleSelect(team.name)}
                    >
                        <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                value === team.name ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {team.name}
                    </div>
                ))}
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
