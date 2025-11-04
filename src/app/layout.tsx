
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { NetworkingDataProvider } from '@/context/networking-context';
import { AuthProvider } from '@/context/auth-context';
import { AdminModeProvider } from '@/context/admin-mode-context';
import { MessageProvider } from '@/context/message-context';
import { SimplePortfolioProvider } from '@/context/simple-portfolio-context';
import { ThemeProvider } from '@/context/theme-context';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const metadata: Metadata = {
  title: 'Yaovi Portfolio',
  description: 'A personal portfolio showcasing projects, experience, and skills, with an AI-powered resume pitch generator.',
  icons: {
    icon: '/YFL.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <AdminModeProvider>
              <MessageProvider>
                <SimplePortfolioProvider>
                  <NetworkingDataProvider>
                    {children}
                  </NetworkingDataProvider>
                </SimplePortfolioProvider>
              </MessageProvider>
            </AdminModeProvider>
            <FirebaseErrorListener />
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
