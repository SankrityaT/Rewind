import type { Metadata } from "next";
import { Space_Grotesk, Inter, Syne } from "next/font/google";
import "./globals.css";
import { FocusModeProvider } from "@/contexts/FocusModeContext";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Rewind - Your Memory Never Forgets",
  description: "Proactive memory intelligence that tells you what to do next. Stop searching, start remembering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${syne.variable} antialiased`}
      >
        <FocusModeProvider>
          {children}
        </FocusModeProvider>
      </body>
    </html>
  );
}
