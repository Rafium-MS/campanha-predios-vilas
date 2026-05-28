import type { Metadata } from "next";

import { Nav } from "@/components/layout/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Território de Prédios e Vilas",
  description: "Sistema para controle de campanha de prédios e vilas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <Nav />
        <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
