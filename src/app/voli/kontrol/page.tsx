"use client";

// This is a placeholder for the volleyball controller page.
// We will build this out in the next steps.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VolleyballControllerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <main className="flex flex-col gap-8 items-center">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-headline text-center">
              Master Kontroler Bola Voli
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Kontroler untuk papan skor bola voli akan dibangun di sini.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
