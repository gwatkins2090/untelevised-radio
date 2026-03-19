import type { Metadata } from "next";
import { Share_Tech_Mono, Black_Ops_One, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Display font - military/propaganda stencil aesthetic
const blackOpsOne = Black_Ops_One({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

// Terminal font - broadcast/data readout
const shareTechMono = Share_Tech_Mono({
  variable: "--font-terminal",
  subsets: ["latin"],
  weight: ["400"],
});

// Monospace - code/technical data
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Untelevised Radio — Resistance Through Sound",
  description: "Independent community radio broadcasting truth, resistance, and liberation. Amplifying voices silenced by oppressive systems.",
  keywords: ["independent radio", "community radio", "resistance", "activism", "underground radio"],
  openGraph: {
    title: "Untelevised Radio — Resistance Through Sound",
    description: "Independent community radio broadcasting truth, resistance, and liberation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${blackOpsOne.variable} ${shareTechMono.variable} ${jetBrainsMono.variable} antialiased crt-screen`}
      >
        {children}
      </body>
    </html>
  );
}
