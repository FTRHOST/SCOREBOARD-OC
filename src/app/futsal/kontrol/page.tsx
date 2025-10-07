"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useDatabase } from "@/firebase";
import { ref, get } from "firebase/database";
import Controller from "@/components/controller/Controller";
import Scoreboard1 from "@/components/scoreboards/Scoreboard1";
import Scoreboard2 from "@/components/scoreboards/Scoreboard2";
import Scoreboard3 from "@/components/scoreboards/Scoreboard3";

export default function ControllerPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const database = useDatabase();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Jangan lakukan pengecekan apapun sampai status auth selesai dimuat
    if (isUserLoading) {
      return;
    }

    // Jika tidak ada user setelah loading selesai, arahkan ke login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Jika ada user, periksa status admin di database
    const adminRef = ref(database, `roles_admin/${user.uid}`);
    get(adminRef).then((snapshot) => {
      if (snapshot.exists()) {
        setIsAdmin(true);
      } else {
        // Jika tidak ada di daftar admin, arahkan ke login
        router.replace("/login");
        setIsAdmin(false);
      }
    }).catch(error => {
      console.error("Error checking admin status:", error);
      // Jika terjadi error, demi keamanan, arahkan ke login
      router.replace("/login");
      setIsAdmin(false);
    });

  }, [user, isUserLoading, router, database]);

  // Tampilkan loading selama status user atau status admin sedang diverifikasi
  if (isUserLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading & Verifying Access...</p>
      </div>
    );
  }

  // Jika setelah verifikasi ternyata bukan admin, jangan render halaman
  // (Meskipun sudah di-redirect, ini sebagai pengaman tambahan)
  if (isAdmin === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline">
          Futsal Scoreboard Pro
        </h1>
        <p className="text-muted-foreground mt-2">
          Central controller for all your futsal match needs.
        </p>
      </header>

      <main className="flex flex-col gap-8 items-start">
        <Controller />

        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4 text-center font-headline">Scoreboard Previews</h2>
          <p className="text-center text-muted-foreground mb-6">
            Click on a scoreboard to open it in a new tab.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 items-start justify-center">
            <div className="flex justify-center w-full">
              <Link href="/futsal/1" target="_blank">
                <Scoreboard1 />
              </Link>
            </div>
            <div className="flex justify-center w-full">
               <Link href="/futsal/2" target="_blank">
                <Scoreboard2 />
              </Link>
            </div>
             <div className="flex justify-center w-full lg:col-span-2 xl:col-span-1">
               <Link href="/futsal/3" target="_blank">
                <Scoreboard3 />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
