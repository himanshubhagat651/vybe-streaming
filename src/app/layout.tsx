import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { UserDataProvider } from "@/context/UserDataContext";
import { AppShell } from "@/components/layout/AppShell";
import { AuthModal } from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "VYBE — Premium Movies & TV Shows Streaming",
  description:
    "VYBE is a premier movie and TV-series streaming and discovery platform featuring cinematic dark and light themes, responsive playback, and seamless content discovery.",
  keywords: [
    "VYBE",
    "movies",
    "tv series",
    "streaming",
    "watch online",
    "cinema",
    "entertainment",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-brand-500/30 selection:text-brand-300">
        <ThemeProvider>
          <AuthProvider>
            <UserDataProvider>
              <AppShell>{children}</AppShell>
              <AuthModal />
            </UserDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
