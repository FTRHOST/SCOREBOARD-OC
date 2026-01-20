
"use client";

import TeamManager from "@/components/controller/TeamManager";

export default function TeamsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manajemen Tim</h1>
      <TeamManager />
    </div>
  );
}
