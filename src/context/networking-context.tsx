
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

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

const LOCAL_STORAGE_KEY = 'networking-contacts';

export function NetworkingDataProvider({ children }: { children: React.ReactNode }) {
    const [contacts, setContacts] = useState<NetworkingContact[]>([]);

    useEffect(() => {
        try {
            const storedContacts = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedContacts) {
                setContacts(JSON.parse(storedContacts));
            }
        } catch (error) {
            console.error("Failed to read networking contacts from localStorage", error);
        }
    }, []);

    const saveContacts = useCallback((updatedContacts: NetworkingContact[]) => {
        try {
            setContacts(updatedContacts);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedContacts));
        } catch (error) {
            console.error("Failed to save networking contacts to localStorage", error);
        }
    }, []);

    const addContact = useCallback((newContactData: Omit<NetworkingContact, 'id'>) => {
        const newContact: NetworkingContact = {
            ...newContactData,
            id: `contact-${Date.now()}`,
        };
        const updatedContacts = [newContact, ...contacts];
        saveContacts(updatedContacts);
    }, [contacts, saveContacts]);

    const updateContact = useCallback((updatedContact: NetworkingContact) => {
        const updatedContacts = contacts.map(c => c.id === updatedContact.id ? updatedContact : c);
        saveContacts(updatedContacts);
    }, [contacts, saveContacts]);

    const deleteContact = useCallback((id: string) => {
        const updatedContacts = contacts.filter(c => c.id !== id);
        saveContacts(updatedContacts);
    }, [contacts, saveContacts]);

    const value = useMemo(() => ({
        contacts,
        setContacts: saveContacts,
        addContact,
        updateContact,
        deleteContact,
    }), [contacts, saveContacts, addContact, updateContact, deleteContact]);

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
