import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import "./globals.css";
import AIAssistantProvider from "../components/ai-provider";

export const metadata: Metadata = {
  title: "NOTSORRY WEATHER - NASA Space Apps 2025",
  description:
    "Future weather on time. Predicciones a tiempo real con datos de la NASA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <AIAssistantProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AIAssistantProvider>
      </body>
    </html>
  );
}
