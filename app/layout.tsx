import type { Metadata, Viewport } from "next";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "PIXEDLE — adivinhe o emoji do dia",
  description:
    "Pixedle é o desafio diário de adivinhar o emoji escondido. A cada erro, ele fica menos pixelado. Você consegue acertar antes de acabar as tentativas?",
  openGraph: {
    title: "PIXEDLE — adivinhe o emoji do dia",
    description:
      "O desafio diário de adivinhar o emoji escondido. A cada erro, ele fica menos pixelado.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "PIXEDLE — adivinhe o emoji do dia",
    description:
      "O desafio diário de adivinhar o emoji escondido. A cada erro, ele fica menos pixelado.",
  },
};

export const viewport: Viewport = {
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
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
