import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mia Digital Solutions | CRM",
  description: "Ajans görev, çekim ve influencer yönetimi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F7F7FA] text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
