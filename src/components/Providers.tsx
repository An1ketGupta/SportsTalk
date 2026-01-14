"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./ToastProvider";
import { GlobalCacheProvider } from "@/context/GlobalCacheContext";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <GlobalCacheProvider>
        <ToastProvider>{children}</ToastProvider>
      </GlobalCacheProvider>
    </SessionProvider>
  );
};
