import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const syne = Syne({ subsets: ["latin"], variable: "--font-head", weight: ["400","500","600","700","800"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["300","400","500"] });
const dmMono = DM_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400","500"] });

export const metadata: Metadata = {
  title: "StudyAI — Your Intelligent Study Companion",
  description: "AI-powered study platform with flashcards, quizzes, and an AI tutor",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
