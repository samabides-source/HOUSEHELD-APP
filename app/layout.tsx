import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/AppShell";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hausheld – Haushaltsaufgaben im Griff",
  description:
    "Hausheld sammelt alle Haushaltsaufgaben an einem Ort: mit Fotos, Zuständigkeiten und Tags.",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
