import type { Metadata } from "next";

import { Nav } from "@/components/layout/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campanha Prédios e Vilas",
  description: "Sistema para controle de campanha de prédios e vilas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <Nav />
        <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
