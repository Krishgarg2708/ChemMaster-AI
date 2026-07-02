import "./globals.css";
import { AppStateProvider } from "@/lib/store";
import Sidebar from "@/components/Sidebar";

// Fonts are loaded via standard <link> tags rather than next/font, so the
// production build never depends on network access to Google Fonts at
// build time (next/font/google fetches font files during `next build`,
// which fails in network-restricted CI/build environments). This keeps
// builds reliable everywhere, including Vercel.
export const metadata = {
  title: "ChemMaster AI — Offline-first Chemistry Revision",
  description:
    "A JEE & board-focused chemistry learning platform: interactive periodic table, chapter notes, and progress tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <AppStateProvider>
          <div className="min-h-screen flex flex-col lg:flex-row">
            <Sidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
