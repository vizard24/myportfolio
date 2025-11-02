
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { NetworkingDataProvider } from '@/context/networking-context';
import { AuthProvider } from '@/context/auth-context';
import { AdminModeProvider } from '@/context/admin-mode-context';
import { MessageProvider } from '@/context/message-context';
import { PortfolioDataProvider } from '@/context/portfolio-data-context';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Yaovi Portfolio',
  description: 'A personal portfolio showcasing projects, experience, and skills, with an AI-powered resume pitch generator.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <AdminModeProvider>
            <MessageProvider>
              <PortfolioDataProvider>
                <NetworkingDataProvider>
                  {children}
                </NetworkingDataProvider>
              </PortfolioDataProvider>
            </MessageProvider>
          </AdminModeProvider>
          <FirebaseErrorListener />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
