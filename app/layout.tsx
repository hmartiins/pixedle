import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PIXEDLE — adivinhe o emoji do dia",
  description:
    "Pixedle é o desafio diário de adivinhar o emoji escondido. A cada erro, ele fica menos pixelado. Você consegue acertar antes de acabar as tentativas?",
  themeColor: "#0f0f1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
