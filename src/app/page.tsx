
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, X } from "lucide-react";
import { useScoreboardData } from "@/hooks/useScoreboardData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { scoreboard, updateScoreboard } = useScoreboardData();
  const logoSrc = scoreboard?.logoSrc;

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (updateScoreboard) {
          updateScoreboard({ logoSrc: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    if (updateScoreboard) {
      updateScoreboard({ logoSrc: null });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="w-full shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center font-headline">
              Pilih Mode Papan Skor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="space-y-2 w-full max-w-md">
              <Label htmlFor="logoUpload">Logo Acara</Label>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <Input id="logoUpload" type="file" accept="image/*,.svg" onChange={handleLogoUpload} className="text-sm" />
                {logoSrc && (
                    <Button variant="outline" size="sm" onClick={handleRemoveLogo}>
                        <X className="mr-2 h-4 w-4" /> Hapus Logo
                    </Button>
                )}
              </div>
            </div>
            {logoSrc && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2 text-center">Pratinjau Logo</p>
                <div className="relative w-32 h-32 mx-auto">
                   <Image src={logoSrc} alt="Logo Preview" fill style={{objectFit: "contain"}} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            className="cursor-pointer hover:shadow-xl hover:border-primary transition-all duration-300"
            onClick={() => navigateTo("/futsal/kontrol")}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-headline">
                ⚽ Futsal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Buka master kontroler untuk papan skor pertandingan futsal.
              </p>
              <div className="flex justify-end items-center mt-4 text-primary font-semibold">
                Buka Kontroler <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-xl hover:border-primary transition-all duration-300"
            onClick={() => navigateTo("/voli/kontrol")}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-headline">
                🏐 Bola Voli
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Buka master kontroler untuk papan skor pertandingan bola voli.
              </p>
              <div className="flex justify-end items-center mt-4 text-primary font-semibold">
                Buka Kontroler <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
