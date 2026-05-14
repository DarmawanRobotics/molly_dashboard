"use client";
import type React from "react";
import { Footer } from "@/components/layout/dashboard/footer";
import { Header } from "@/components/layout/dashboard/header";
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
        <main className="flex-1 flex min-h-0 w-full overflow-hidden">
          {children}
        </main>
        <Footer />
      </div>
    </RosProvider>
  );
}
