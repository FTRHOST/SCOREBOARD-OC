
"use client";

import LayoutEditor from "@/components/controller/LayoutEditor";
import VolleyballLayoutEditor from "@/components/controller/VolleyballLayoutEditor";
import ConfigManager from "@/components/controller/ConfigManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function ConfigPage() {

  // Dummy onElementSelect function as it's required by the editors
  // but the preview is not on this page.
  const handleElementSelect = (elementKey: any) => {
    // In a more advanced implementation, this could use a global state
    // to highlight the element in a separate preview window.
    console.log("Selected element:", elementKey);
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
            <CardTitle className="text-2xl font-bold font-headline">
              Pusat Konfigurasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="futsal-layout">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="futsal-layout">Layout Futsal</TabsTrigger>
                <TabsTrigger value="volleyball-layout">Layout Voli</TabsTrigger>
                <TabsTrigger value="config-manager">Manajemen Data</TabsTrigger>
              </TabsList>
              <TabsContent value="futsal-layout" className="mt-6">
                <p className="text-muted-foreground mb-4">
                  Catatan: Pratinjau papan skor hanya tersedia di halaman kontroler futsal.
                  Perubahan di sini akan langsung diterapkan.
                </p>
                <LayoutEditor onElementSelect={handleElementSelect} />
              </TabsContent>
              <TabsContent value="volleyball-layout" className="mt-6">
                 <p className="text-muted-foreground mb-4">
                  Catatan: Pratinjau papan skor hanya tersedia di halaman kontroler bola voli.
                  Perubahan di sini akan langsung diterapkan.
                </p>
                <VolleyballLayoutEditor onElementSelect={handleElementSelect} />
              </TabsContent>
              <TabsContent value="config-manager" className="mt-6">
                <p className="text-muted-foreground mb-4">
                    Ekspor semua data papan skor sebagai file cadangan, atau impor dari file untuk memulihkan. Anda juga dapat mengatur ulang semua data ke kondisi awal.
                </p>
                <ConfigManager />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
