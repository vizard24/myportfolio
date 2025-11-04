
"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './auth-context';

interface AdminModeContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

export function AdminModeProvider({ children }: { children: React.ReactNode }) {
  const { user, loginWithGoogle, logout, loading } = useAuth();

  const isAdminMode = !!user && !loading; 

  const toggleAdminMode = () => {
    if (isAdminMode) {
      logout();
    }
    // Login is handled by the LoginDialog component
  };
  
  const value = useMemo(() => ({ isAdminMode, toggleAdminMode }), [isAdminMode, toggleAdminMode]);

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
