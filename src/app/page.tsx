"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // Wait until we know the user's auth state
    if (!isUserLoading) {
      if (user) {
        // If user is logged in, send them to the controller
        router.replace("/futsal/kontrol");
      } else {
        // If no user, send them to the login page
        router.replace("/login");
      }
    }
  }, [router, user, isUserLoading]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-foreground">Redirecting...</p>
    </div>
  );
}
