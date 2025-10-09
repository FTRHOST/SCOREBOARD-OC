
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { get, ref } from 'firebase/database';
import { initializeFirebase } from '@/firebase';

// This function can be used to fetch data on the server side.
async function getEventTitle() {
  try {
    const { database } = initializeFirebase();
    const eventTitleRef = ref(database, 'scoreboard/eventTitle');
    const snapshot = await get(eventTitleRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    // In a real app, you'd want to handle this error more gracefully
    console.error("Could not fetch event title on the server:", error);
  }
  return 'Futsal Scoreboard Pro'; // Default title
}

export async function generateMetadata(): Promise<Metadata> {
  const title = await getEventTitle();
  return {
    title: title,
    description: 'Interactive Futsal and Volleyball Scoreboard Controller',
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Paytone+One&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
