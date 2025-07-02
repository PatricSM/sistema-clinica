import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CustomAuthProvider } from '@/contexts/CustomAuthContext'
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema Clínica - Gestão Completa",
  description: "Sistema completo para gestão de clínicas de psicologia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white min-h-screen`}
      >
        <AuthErrorBoundary>
          <CustomAuthProvider>
            {children}
          </CustomAuthProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}
