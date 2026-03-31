import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Generador Político",
  description: "MVP de Generador de Contenido Político",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
