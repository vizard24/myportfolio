
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = "fgadedjro@gmail.com";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = result.user;

      if (loggedInUser.email === ADMIN_EMAIL) {
        toast({
          title: "Login Successful",
          description: "You have successfully logged in as an admin.",
        });
        setUser(loggedInUser);
        router.refresh();
      } else {
        // This case is unlikely if rules are set up, but good for defense-in-depth
        toast({
          title: "Unauthorized Account",
          description: "This account is not authorized for admin access.",
          variant: "destructive",
        });
        await signOut(auth);
        setUser(null);
        throw new Error("Unauthorized");
      }
    } catch (error: any) {
        console.error("Error during email/password login:", error);
        let description = "Something went wrong during login. Please try again.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            description = "Invalid email or password. Please check your credentials and try again.";
        }
        toast({
            title: "Login Failed",
            description,
            variant: "destructive",
        });
        throw error; // Re-throw to be caught by the component
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
