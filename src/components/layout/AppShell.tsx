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

        {/* Content Pane offset smoothly by sidebar width */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out w-full",
            isSidebarOpen ? "md:ml-60" : "md:ml-20"
          )}
        >
          <main className="flex-1 max-w-[1920px] 2xl:max-w-[2100px] 3xl:max-w-[2400px] mx-auto px-3.5 sm:px-6 md:px-8 2xl:px-12 pb-16 pt-3 md:pt-5 w-full">
            {children}
            <Footer />
          </main>
        </div>
      </div>

      {/* Mobile Navigation Dock */}
      <MobileNav />
    </div>
  );
}
