"use client";
import type React from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { RosProvider } from "@/components/providers/ros-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RosProvider>
      <div className="h-screen flex flex-col bg-mol-root text-txt-primary font-sans">
        <Header />
        <main className="flex-1 overflow-hidden flex min-h-0 w-full">
          {children}
        </main>
        <Footer />
      </div>
    </RosProvider>
  );
}
