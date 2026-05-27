import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Qdischarge — Physician Workflow Platform",
  description: "AI-Assisted Discharge Summary Automation & Multi-Department Handoff Platform for Indian Healthcare (NABH COP.9, ABDM/NHCX, HL7 FHIR R4)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "font-sans", geist.variable)}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-ink text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

