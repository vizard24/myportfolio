
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

export interface Message {
    id: string;
    name: string;
    email: string;
    message: string;
    timestamp: number;
    isRead: boolean;
}

interface MessageContextType {
  messages: Message[];
  addMessage: (newMessage: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => void;
  deleteMessage: (id: string) => void;
  markAllAsRead: () => void;
  hasUnreadMessages: boolean;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'portfolio-messages';

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        try {
            const storedMessages = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages));
            }
        } catch (error) {
            console.error("Failed to read messages from localStorage", error);
            // If localStorage is blocked or fails, start with an empty array
            setMessages([]);
        }
    }, []);

    const saveMessages = useCallback((updatedMessages: Message[]) => {
        try {
            setMessages(updatedMessages);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedMessages));
        } catch (error) {
            console.error("Failed to save messages to localStorage", error);
        }
    }, []);
    

    const addMessage = useCallback((newMessageData: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
        const newMessage: Message = {
            ...newMessageData,
            id: `msg-${Date.now()}`,
            timestamp: Date.now(),
            isRead: false
        };
        const updatedMessages = [newMessage, ...messages];
        saveMessages(updatedMessages);
    }, [messages, saveMessages]);

    const deleteMessage = useCallback((id: string) => {
        const updatedMessages = messages.filter(msg => msg.id !== id);
        saveMessages(updatedMessages);
    }, [messages, saveMessages]);

    const markAllAsRead = useCallback(() => {
        const updatedMessages = messages.map(msg => ({ ...msg, isRead: true }));
        saveMessages(updatedMessages);
    }, [messages, saveMessages]);
    
    const hasUnreadMessages = useMemo(() => {
        return messages.some(msg => !msg.isRead);
    }, [messages]);

    const value = useMemo(() => ({
        messages,
        addMessage,
        deleteMessage,
        markAllAsRead,
        hasUnreadMessages,
    }), [messages, addMessage, deleteMessage, markAllAsRead, hasUnreadMessages]);

    return (
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    );
}

export function useMessages() {
    const context = useContext(MessageContext);
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessageProvider');
    }
    return context;
}
