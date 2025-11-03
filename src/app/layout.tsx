
import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { NetworkingDataProvider } from '@/context/networking-context';
import { AuthProvider } from '@/context/auth-context';
import { AdminModeProvider } from '@/context/admin-mode-context';
import { MessageProvider } from '@/context/message-context';
import { PortfolioDataProvider } from '@/context/portfolio-data-context';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });


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
      <body className={`${inter.variable} font-sans antialiased`}>
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
