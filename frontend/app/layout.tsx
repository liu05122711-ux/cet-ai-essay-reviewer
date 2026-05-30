import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "四六级AI作文批改系统",
  description: "CET-4/CET-6 AI essay scoring and feedback platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

