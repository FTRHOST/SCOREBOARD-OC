
"use client";

import ConfigManager from "@/components/controller/ConfigManager";
import CloudBackupManager from "@/components/controller/CloudBackupManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function ConfigPage() {

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

      <main className="flex flex-col gap-8 items-center pt-10">
        <CloudBackupManager />
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-headline text-center">
              Pusat Konfigurasi File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6 text-center">
                Ekspor semua data papan skor sebagai file cadangan, impor dari file untuk memulihkan, atau atur ulang semua data ke kondisi awal.
            </p>
            <ConfigManager />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
