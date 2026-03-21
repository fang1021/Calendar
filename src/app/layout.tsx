import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "共有カレンダー",
  description: "予定を共有するカレンダーアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
