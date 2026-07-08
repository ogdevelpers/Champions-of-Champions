import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Champions of Champions | Employee Engagement",
  description: "Play guess the star, memory match, and dubsmash games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-full antialiased sparkle-bg" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
