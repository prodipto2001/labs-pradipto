import type { Metadata } from "next";
import { Nanum_Pen_Script } from "next/font/google";
import "./globals.css";

import { Phudu } from "next/font/google";

const spaceGrotesk = Phudu({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const nanumPenScript = Nanum_Pen_Script({
  variable: "--font-nanum-pen-script",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Labs",
  description: "A personal workshop of digital experiments and unfinished thoughts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${spaceGrotesk.variable} ${nanumPenScript.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
