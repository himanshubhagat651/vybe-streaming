"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebarMobile = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Main Layout Area */}
      <div className="flex flex-1 relative">
        {/* Sidebar (Desktop Rail / Drawer + Mobile Overlay) */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebarMobile} />

        {/* Content Area with dynamic left offset matching sidebar */}
        <main
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out px-4 md:px-8 pb-12 pt-4 max-w-7xl mx-auto w-full",
            isSidebarOpen ? "md:pl-64" : "md:pl-24"
          )}
        >
          {children}
          <Footer />
        </main>
      </div>

      {/* Mobile Navigation Dock */}
      <MobileNav />
    </div>
  );
}
