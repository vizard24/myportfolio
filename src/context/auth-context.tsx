
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
  loginWithGoogle: () => Promise<void>;
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
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `User: ${user.email}` : "No user");
      
      if (user && user.email !== ADMIN_EMAIL) {
        console.log("Unauthorized user detected:", user.email);
        // If a user is logged in but is not the admin, log them out.
        toast({
          title: "Unauthorized Access",
          description: "This account is not authorized for admin access.",
          variant: "destructive",
        });
        handleSignOut(false); // Sign out without showing the "Logged out" toast
        setUser(null);
      } else {
        console.log("Setting user:", user ? user.email : "null");
        setUser(user);
      }
      setLoading(false);
    });
    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);



  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      console.log("Attempting Google sign-in");
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      console.log("Google sign-in successful for:", loggedInUser.email);

      if (loggedInUser.email === ADMIN_EMAIL) {
        console.log("Admin access granted via Google");
        toast({
          title: "Welcome Back!",
          description: "You have successfully logged in as admin.",
        });
        setUser(loggedInUser);
        router.refresh();
      } else {
        console.log("Unauthorized Google access attempt:", loggedInUser.email);
        toast({
          title: "Access Denied",
          description: `The account ${loggedInUser.email} is not authorized for admin access. Only fgadedjro@gmail.com is allowed.`,
          variant: "destructive",
        });
        await signOut(auth);
        setUser(null);
        throw new Error("Unauthorized");
      }
    } catch (error: any) {
      console.error("Error during Google sign-in:", error);
      let description = "Something went wrong during Google sign-in. Please try again.";
      
      // Handle specific Google auth errors
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          description = "Sign-in was cancelled. Please try again.";
          break;
        case 'auth/popup-blocked':
          description = "Pop-up was blocked by your browser. Please allow pop-ups and try again.";
          break;
        case 'auth/network-request-failed':
          description = "Network error. Please check your internet connection and try again.";
          break;
        default:
          if (error.message === "Unauthorized") {
            description = "This Google account is not authorized for admin access.";
          }
      }
      
      toast({
        title: "Google Sign-In Failed",
        description,
        variant: "destructive",
      });
      throw error;
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
    loginWithGoogle,
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
