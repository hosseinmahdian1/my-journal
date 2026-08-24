"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Scene3DBackground } from "@/components/3d/Scene3DBackground";
import { cn } from "@/lib/utils";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="relative z-10 flex min-h-screen overflow-x-hidden">
      {/* 3D WebGL Fluid Wave & Neon Particle Mesh */}
      <Scene3DBackground particleCount={1600} interactive={true} />

      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 relative z-10",
          isCollapsed ? "pl-20" : "pl-64"
        )}
      >
        <Header />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  );
}
