import "./globals.css";
import { AppStateProvider } from "@/lib/store";
import Sidebar from "@/components/Sidebar";
import GlobalSearch from "@/components/GlobalSearch";
import SplashScreen from "@/components/SplashScreen";
import LiveBackground from "@/components/LiveBackground";

// Fonts are loaded via standard <link> tags rather than next/font, so the
// production build never depends on network access to Google Fonts at
// build time (next/font/google fetches font files during `next build`,
// which fails in network-restricted CI/build environments). This keeps
// builds reliable everywhere, including Vercel.
export const metadata = {
  title: "ChemMaster AI — Intelligent Chemistry for a Brighter Tomorrow",
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
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,500..800&family=Hanken+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <div className="ambient" aria-hidden="true" />
        <LiveBackground />
        <SplashScreen />
        <AppStateProvider>
          <div className="min-h-screen flex flex-col lg:flex-row">
            <Sidebar />
            <main className="flex-1 min-w-0">
              <div className="sticky top-0 z-20 border-b border-ink-border/70 backdrop-blur px-6 md:px-10 py-3 topbar">
                <GlobalSearch />
              </div>
              {children}
            </main>
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
