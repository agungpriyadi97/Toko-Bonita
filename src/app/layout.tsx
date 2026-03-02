import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Toko Bonita - Kecantikan & Perlengkapan Bayi",
    template: "%s | Toko Bonita",
  },
  description: "Toko Bonita menyediakan produk kecantikan berkualitas dan perlengkapan bayi lengkap dengan harga terjangkau. Kosmetik, skincare, susu bayi, diapers, dan perlengkapan bayi lainnya.",
  keywords: ["toko kosmetik", "perlengkapan bayi", "skincare", "susu bayi", "diapers", "kecantikan", "Tangerang"],
  authors: [{ name: "Toko Bonita" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Toko Bonita - Kecantikan & Perlengkapan Bayi",
    description: "Produk kecantikan berkualitas dan perlengkapan bayi lengkap",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
