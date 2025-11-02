
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { usePortfolioData } from './portfolio-data-context';
import { networkingContactsData } from '@/data/portfolio-data';

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
    const { personalInfo, setPersonalInfo } = usePortfolioData();
    // @ts-ignore
    const contacts = personalInfo.networkingContacts || [];
    
    const setContacts = (newContacts: NetworkingContact[]) => {
        setPersonalInfo({
            ...personalInfo,
            // @ts-ignore
            networkingContacts: newContacts
        });
    }

    const addContact = useCallback((newContactData: Omit<NetworkingContact, 'id'>) => {
        const newContact: NetworkingContact = {
            ...newContactData,
            id: `contact-${Date.now()}`,
        };
        const updatedContacts = [newContact, ...contacts];
        setContacts(updatedContacts);
    }, [contacts, setContacts]);

    const updateContact = useCallback((updatedContact: NetworkingContact) => {
        const updatedContacts = contacts.map((c: NetworkingContact) => c.id === updatedContact.id ? updatedContact : c);
        setContacts(updatedContacts);
    }, [contacts, setContacts]);

    const deleteContact = useCallback((id: string) => {
        const updatedContacts = contacts.filter((c: NetworkingContact) => c.id !== id);
        setContacts(updatedContacts);
    }, [contacts, setContacts]);

    const value = useMemo(() => ({
        contacts,
        setContacts,
        addContact,
        updateContact,
        deleteContact,
    }), [contacts, setContacts, addContact, updateContact, deleteContact]);

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
