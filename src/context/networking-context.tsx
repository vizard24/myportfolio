
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { useSimplePortfolio } from './simple-portfolio-context';

export type ContactStatus = 'Not Contacted' | 'Contacted' | 'In Progress' | 'Follow-up Needed' | 'Closed';

export interface NetworkingContact {
    id: string;
    name: string;
    linkedinUrl: string;
    companies: string; // Storing as comma-separated string for simplicity
    positions: string; // Storing as comma-separated string
    certifications: string; // Storing as comma-separated string
    college: string;
    status: ContactStatus;
}

interface NetworkingDataContextType {
  contacts: NetworkingContact[];
  setContacts: (contacts: NetworkingContact[]) => void;
  addContact: (newContact: Omit<NetworkingContact, 'id'>) => void;
  updateContact: (updatedContact: NetworkingContact) => void;
  deleteContact: (id: string) => void;
}

const NetworkingDataContext = createContext<NetworkingDataContextType | undefined>(undefined);


export function NetworkingDataProvider({ children }: { children: React.ReactNode }) {
    // Note: Networking contacts are not part of the simple structure yet
    // For now, we'll use local state
    const [networkingContacts, setNetworkingContacts] = useState<NetworkingContact[]>([]);
    
    const setContacts = (newContacts: NetworkingContact[]) => {
        setNetworkingContacts(newContacts);
    }

    const addContact = useCallback((newContactData: Omit<NetworkingContact, 'id'>) => {
        const newContact: NetworkingContact = {
            ...newContactData,
            id: `contact-${Date.now()}`,
        };
        const updatedContacts = [newContact, ...(networkingContacts || [])];
        setContacts(updatedContacts);
    }, [networkingContacts, setContacts]);

    const updateContact = useCallback((updatedContact: NetworkingContact) => {
        const updatedContacts = (networkingContacts || []).map((c: NetworkingContact) => c.id === updatedContact.id ? updatedContact : c);
        setContacts(updatedContacts);
    }, [networkingContacts, setContacts]);

    const deleteContact = useCallback((id: string) => {
        const updatedContacts = (networkingContacts || []).filter((c: NetworkingContact) => c.id !== id);
        setContacts(updatedContacts);
    }, [networkingContacts, setContacts]);

    const value = useMemo(() => ({
        contacts: networkingContacts || [],
        setContacts,
        addContact,
        updateContact,
        deleteContact,
    }), [networkingContacts, setContacts, addContact, updateContact, deleteContact]);

    return (
        <NetworkingDataContext.Provider value={value}>
            {children}
        </NetworkingDataContext.Provider>
    );
}

export function useNetworkingData() {
    const context = useContext(NetworkingDataContext);
    if (context === undefined) {
        throw new Error('useNetworkingData must be used within a NetworkingDataProvider');
    }
    return context;
}
