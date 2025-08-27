
"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './auth-context';

interface AdminModeContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void; // This will now either log in or log out
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

export function AdminModeProvider({ children }: { children: React.ReactNode }) {
  const { user, login, logout } = useAuth();

  // Admin mode is on if the user is logged in.
  const isAdminMode = !!user; 

  const toggleAdminMode = () => {
    if (isAdminMode) {
      logout();
    } else {
      login();
    }
  };
  
  const value = useMemo(() => ({ isAdminMode, toggleAdminMode }), [isAdminMode]);

  return (
    <AdminModeContext.Provider value={value}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const context = useContext(AdminModeContext);
  if (context === undefined) {
    throw new Error('useAdminMode must be used within an AdminModeProvider');
  }
  return context;
}
