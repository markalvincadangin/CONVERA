import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RatchetAI — Evidence-Ratcheted Venture Engine",
  description: "Evidence-Ratcheted Problem-to-Solution Multi-Agent Pipeline for Technopreneurship & Startup Incubators.",
  icons: {
    icon: "/brand/favicon.ico",
    shortcut: "/brand/favicon.ico",
    apple: "/brand/brandmark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200"
      >
        {children}
      </body>
    </html>
  );
}
