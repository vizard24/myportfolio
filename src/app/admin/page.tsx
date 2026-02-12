"use client";

import { useAuth } from '@/context/auth-context';
import { useAdminMode } from '@/context/admin-mode-context';
import { SimpleAdminDashboard } from '@/components/admin/simple-admin-dashboard';
import { LoginDialog } from '@/components/admin/login-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, LogIn } from 'lucide-react';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { isAdminMode } = useAdminMode();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdminMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>
              You need to be logged in as an administrator to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginDialog>
              <Button className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In as Admin
              </Button>
            </LoginDialog>
            <div className="text-center">
              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ← Back to Portfolio
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SimpleAdminDashboard />
  );
}