"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
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
