"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useAdminMode } from '@/context/admin-mode-context';
import { Loader, CheckCircle, XCircle, User, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AuthTest() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const { isAdminMode } = useAdminMode();
  const { toast } = useToast();
  const [isGoogleLogging, setIsGoogleLogging] = useState(false);

  const handleTestGoogleLogin = async () => {
    setIsGoogleLogging(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Google Login Test Successful",
        description: "Admin Google authentication is working correctly!",
      });
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setIsGoogleLogging(false);
    }
  };

  const handleTestLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout Test Successful",
        description: "Admin logout is working correctly!",
      });
    } catch (error) {
      toast({
        title: "Logout Test Failed",
        description: "There was an issue with logout functionality.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Admin Authentication Test
        </CardTitle>
        <CardDescription>
          Test the admin login functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authentication Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span className="text-sm">Checking authentication...</span>
            </>
          ) : user ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                Logged in as: <strong>{user.email}</strong>
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm">Not authenticated</span>
            </>
          )}
        </div>

        {/* Admin Mode Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
          {isAdminMode ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Admin mode: <strong>Active</strong></span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm">Admin mode: <strong>Inactive</strong></span>
            </>
          )}
        </div>

        {/* Login Form or Logout Button */}
        {!user ? (
          <>
            {/* Google Sign-In Button */}
            <Button 
              onClick={handleTestGoogleLogin} 
              disabled={isGoogleLogging}
              variant="outline" 
              className="w-full mb-4"
            >
              {isGoogleLogging ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Testing Google Login...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Test Google Login
                </>
              )}
            </Button>
            
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or test with email</span>
              </div>
            </div>
          </>
        ) : null}
        
        {!user ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Authentication is restricted to Google login only
            </p>
            <p className="text-xs text-muted-foreground">
              Only fgadedjro@gmail.com is authorized for admin access
            </p>
          </div>
        ) : (
          <Button onClick={handleTestLogout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Test Logout
          </Button>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Instructions:</strong></p>
          <p>🔥 Click "Test Google Login" to authenticate</p>
          <p>✅ Verify authentication and admin mode activate</p>
          <p>🚪 Test logout functionality</p>
          <p>⚠️ Only fgadedjro@gmail.com is authorized</p>
        </div>
      </CardContent>
    </Card>
  );
}