import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "映画原作クイズ",
  description: "合成ストーリーの元になった映画を当てるクイズアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-gray-800">
                映画原作クイズ
              </Link>
              <div className="flex gap-4">
                <Link href="/practice" className="text-gray-600 hover:text-gray-900">
                  Practice
                </Link>
                <Link href="/test" className="text-gray-600 hover:text-gray-900">
                  Test
                </Link>
                <Link href="/movies" className="text-gray-600 hover:text-gray-900">
                  映画一覧
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
