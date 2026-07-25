import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KretivWork Central Sales",
  description: "Central dashboard jualan KretivWork dan Chef Ammar.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
