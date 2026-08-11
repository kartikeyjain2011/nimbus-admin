import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nimbus Cloud Gaming | Super Admin Telemetry & Operations Console",
  description: "Real-time stream telemetry, GPU rig management, subscription MRR analytics, and game library administration for Nimbus Cloud Gaming.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-zinc-900 font-sans">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
