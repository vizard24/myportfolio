
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = "fgadedjro@gmail.com";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async (showToast = true) => {
    try {
      await signOut(auth);
      if (showToast) {
        toast({
          title: "Logged Out",
          description: "You have successfully logged out.",
        });
      }
      router.refresh();
    } catch (error) {
      console.error("Error during logout:", error);
       toast({
        title: "Logout Failed",
        description: "Something went wrong during logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email !== ADMIN_EMAIL) {
        // If a user is logged in but is not the admin, log them out.
        toast({
          title: "Unauthorized Access",
          description: "This account is not authorized for admin access.",
          variant: "destructive",
        });
        handleSignOut(false); // Sign out without showing the "Logged out" toast
        setUser(null);
      } else {
        setUser(user);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      if (loggedInUser.email === ADMIN_EMAIL) {
        toast({
          title: "Login Successful",
          description: "You have successfully logged in as an admin.",
        });
        setUser(loggedInUser);
        router.refresh();
      } else {
        toast({
          title: "Unauthorized Account",
          description: "This account is not authorized for admin access. Please use the admin account.",
          variant: "destructive",
        });
        await signOut(auth); // Sign out the unauthorized user.
        setUser(null);
      }
    } catch (error: any) {
        // Don't show an error toast if the user simply closed the popup.
        if (error.code === 'auth/popup-closed-by-user') {
            console.log("Login cancelled by user.");
        } else {
            console.error("Error during Google login:", error);
            toast({
                title: "Login Failed",
                description: "Something went wrong during login. Please try again.",
                variant: "destructive",
            });
        }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await handleSignOut();
  };
  
  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
