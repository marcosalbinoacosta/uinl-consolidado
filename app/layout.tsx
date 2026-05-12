import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UINL Bolivia 2026 — Consolidado",
  description: "Reporte consolidado del congreso UINL Bolivia 2026.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
