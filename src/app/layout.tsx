import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import ReduxProvider from "@/store/providers/ReduxProvider";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "MONCRADEL - Delivery Partner Portal",
  description: "Pediatric Meal Delivery, Route Optimization & Order Handover for Delivery Partners",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MONCRADEL",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png" }
    ]
  },
};

export const viewport: Viewport = {
  themeColor: "#A5D8FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-[#F8F9FA] text-slate-800 antialiased font-sans selection:bg-[#A5D8FF] selection:text-[#1E4E70]"
        suppressHydrationWarning
      >
        <ReduxProvider>
          <AppShell>{children}</AppShell>
        </ReduxProvider>
      </body>
    </html>
  );
}
