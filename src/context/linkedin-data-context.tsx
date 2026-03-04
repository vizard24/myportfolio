"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { loadLinkedInDataFromFirestore, saveLinkedInDataToFirestore } from '@/lib/linkedin-db';

export interface LinkedInConnection {
    firstName: string;
    lastName: string;
    url: string;
    emailAddress: string;
    company: string;
    position: string;
    connectedOn: string;
}

export interface LinkedInMessage {
    from: string;
    to: string;
    date: string;
    subject: string;
    content: string;
    folder: string;
}

export interface LinkedInInvitation {
    from: string;
    to: string;
    sentAt: string;
    message: string;
    direction: string;
}

export type LinkedInDataType = 'connections' | 'messages' | 'invitations' | 'skills' | 'projects' | 'education' | 'positions' | 'recommendations';

interface LinkedInDataContextType {
    connections: LinkedInConnection[];
    messages: LinkedInMessage[];
    invitations: LinkedInInvitation[];
    skills: any[];
    projects: any[];
    education: any[];
    positions: any[];
    recommendations: any[];
    isParsing: boolean;
    parseCSVData: (file: File, type: LinkedInDataType) => void;
    clearData: () => void;
}

const LinkedInDataContext = createContext<LinkedInDataContextType | undefined>(undefined);

export function LinkedInDataProvider({ children }: { children: ReactNode }) {
    const [connections, setConnections] = useState<LinkedInConnection[]>([]);
    const [messages, setMessages] = useState<LinkedInMessage[]>([]);
    const [invitations, setInvitations] = useState<LinkedInInvitation[]>([]);
    const [skills, setSkills] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [education, setEducation] = useState<any[]>([]);
    const [positions, setPositions] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);

    const [isParsing, setIsParsing] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setConnections([]);
            setMessages([]);
            setInvitations([]);
            setSkills([]);
            setProjects([]);
            setEducation([]);
            setPositions([]);
            setRecommendations([]);
            return;
        }

        const fetchInitialData = async () => {
            try {
                const [dbConnections, dbMessages, dbInvitations, dbSkills, dbProjects, dbEducation, dbPositions, dbRecommendations] = await Promise.all([
                    loadLinkedInDataFromFirestore(user.uid, 'connections'),
                    loadLinkedInDataFromFirestore(user.uid, 'messages'),
                    loadLinkedInDataFromFirestore(user.uid, 'invitations'),
                    loadLinkedInDataFromFirestore(user.uid, 'skills'),
                    loadLinkedInDataFromFirestore(user.uid, 'projects'),
                    loadLinkedInDataFromFirestore(user.uid, 'education'),
                    loadLinkedInDataFromFirestore(user.uid, 'positions'),
                    loadLinkedInDataFromFirestore(user.uid, 'recommendations')
                ]);

                if (dbConnections.length) setConnections(dbConnections);
                if (dbMessages.length) setMessages(dbMessages);
                if (dbInvitations.length) setInvitations(dbInvitations);
                if (dbSkills.length) setSkills(dbSkills);
                if (dbProjects.length) setProjects(dbProjects);
                if (dbEducation.length) setEducation(dbEducation);
                if (dbPositions.length) setPositions(dbPositions);
                if (dbRecommendations.length) setRecommendations(dbRecommendations);
            } catch (error) {
                console.error("Error loading initial LinkedIn data:", error);
            }
        };

        fetchInitialData();
    }, [user]);

    const parseCSVData = (file: File, type: LinkedInDataType) => {
        setIsParsing(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) {
                setIsParsing(false);
                return;
            }

            let csvToParse = text;
            const lines = text.split(/\r?\n/);

            let headerIndex = -1;
            if (type === 'connections') {
                headerIndex = lines.findIndex(line => line.startsWith('First Name') || line.startsWith('"First Name"'));
            } else if (type === 'messages' || type === 'invitations') {
                headerIndex = lines.findIndex(line => /^(FROM|From|"FROM"|"From")/i.test(line));
            } else {
                // For other files, usually the first non-empty line or first line is the header
                headerIndex = 0;
            }

            if (headerIndex > 0) {
                csvToParse = lines.slice(headerIndex).join('\n');
            }

            Papa.parse(csvToParse, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    try {
                        let cleanData: any[] = [];

                        if (type === 'connections') {
                            cleanData = results.data.map((row: any) => ({
                                firstName: row['First Name'] || '',
                                lastName: row['Last Name'] || '',
                                url: row['URL'] || '',
                                emailAddress: row['Email Address'] || '',
                                company: row['Company'] || '',
                                position: row['Position'] || '',
                                connectedOn: row['Connected On'] || '',
                            })).filter((c: any) => c.firstName || c.lastName);
                            setConnections(cleanData);
                        } else if (type === 'messages') {
                            cleanData = results.data.map((row: any) => ({
                                from: row['From'] || row['FROM'] || '',
                                to: row['To'] || row['TO'] || '',
                                date: row['DATE'] || row['Date'] || '',
                                subject: row['SUBJECT'] || row['Subject'] || '',
                                content: row['CONTENT'] || row['Content'] || '',
                                folder: row['FOLDER'] || row['Folder'] || '',
                            })).filter((m: any) => m.from || m.to);
                            setMessages(cleanData);
                        } else if (type === 'invitations') {
                            cleanData = results.data.map((row: any) => ({
                                from: row['From'] || row['FROM'] || '',
                                to: row['To'] || row['TO'] || '',
                                sentAt: row['Sent At'] || '',
                                message: row['Message'] || '',
                                direction: row['Direction'] || '',
                            })).filter((i: any) => i.from || i.to);
                            setInvitations(cleanData);
                        } else if (type === 'skills') {
                            cleanData = results.data;
                            setSkills(cleanData);
                        } else if (type === 'projects') {
                            cleanData = results.data;
                            setProjects(cleanData);
                        } else if (type === 'education') {
                            cleanData = results.data;
                            setEducation(cleanData);
                        } else if (type === 'positions') {
                            cleanData = results.data;
                            setPositions(cleanData);
                        } else if (type === 'recommendations') {
                            cleanData = results.data;
                            setRecommendations(cleanData);
                        }

                        if (user) {
                            saveLinkedInDataToFirestore(user.uid, type, cleanData).catch(console.error);
                        }

                        toast({
                            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Loaded`,
                            description: `Successfully loaded ${cleanData.length} records.`,
                        });
                    } catch (error) {
                        console.error(`Error processing ${type} data:`, error);
                        toast({
                            title: "Error Parsing CSV",
                            description: `Failed to process the uploaded file format. Please ensure it is the correct LinkedIn CSV.`,
                            variant: "destructive"
                        });
                    } finally {
                        setIsParsing(false);
                    }
                },
                error: (error: any) => {
                    toast({
                        title: "File Read Error",
                        description: error.message,
                        variant: "destructive",
                    });
                    setIsParsing(false);
                },
            });
        };

        reader.onerror = () => {
            toast({
                title: "File Read Error",
                description: "Failed to read the file.",
                variant: "destructive",
            });
            setIsParsing(false);
        };

        reader.readAsText(file);
    };

    const clearData = () => {
        setConnections([]);
        setMessages([]);
        setInvitations([]);
        setSkills([]);
        setProjects([]);
        setEducation([]);
        setPositions([]);
        setRecommendations([]);

        if (user) {
            saveLinkedInDataToFirestore(user.uid, 'connections', []).catch(console.error);
            saveLinkedInDataToFirestore(user.uid, 'messages', []).catch(console.error);
            saveLinkedInDataToFirestore(user.uid, 'invitations', []).catch(console.error);
            saveLinkedInDataToFirestore(user.uid, 'skills', []).catch(console.error);
            saveLinkedInDataToFirestore(user.uid, 'projects', []).catch(console.error);
            saveLinkedInDataToFirestore(user.uid, 'education', []).catch(console.error);
            saveLinkedInDataToFirestore(user.uid, 'positions', []).catch(console.error);
            saveLinkedInDataToFirestore(user.uid, 'recommendations', []).catch(console.error);
        }
    };

    return (
        <LinkedInDataContext.Provider value={{ connections, messages, invitations, skills, projects, education, positions, recommendations, isParsing, parseCSVData, clearData }}>
            {children}
        </LinkedInDataContext.Provider>
    );
}

export function useLinkedInData() {
    const context = useContext(LinkedInDataContext);
    if (context === undefined) {
        throw new Error('useLinkedInData must be used within a LinkedInDataProvider');
    }
    return context;
}
