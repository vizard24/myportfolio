
"use client";

import React, { useState, useEffect } from 'react';
import SectionWrapper from '@/components/layout/section-wrapper';
import { useNetworkingData, type NetworkingContact, type ContactStatus } from '@/context/networking-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Pencil, Save, Trash2, X, Linkedin, Building, Briefcase, GraduationCap, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';


const statusColors: Record<ContactStatus, string> = {
    'Not Contacted': 'bg-gray-500',
    'Contacted': 'bg-blue-500',
    'In Progress': 'bg-yellow-500 text-black',
    'Follow-up Needed': 'bg-orange-500',
    'Closed': 'bg-green-500',
};

function ContactCard({ contact: initialContact, onSave, onDelete }: { contact: NetworkingContact, onSave: (c: NetworkingContact) => void, onDelete: (id: string) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContact, setEditedContact] = useState(initialContact);
    const { toast } = useToast();

    useEffect(() => {
        setEditedContact(initialContact);
    }, [initialContact]);

    const handleSave = () => {
        onSave(editedContact);
        setIsEditing(false);
        toast({ title: "Contact Saved" });
    };

    const handleCancel = () => {
        setEditedContact(initialContact);
        setIsEditing(false);
    };

    const handleDelete = () => {
        onDelete(editedContact.id);
        toast({ title: "Contact Deleted", variant: "destructive" });
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedContact(prev => ({...prev, [name]: value}));
    };

    const handleStatusChange = (status: ContactStatus) => {
        setEditedContact(prev => ({ ...prev, status }));
    };

    const currentContact = isEditing ? editedContact : initialContact;

    return (
        <Card className="relative group">
            {!isEditing ? (
                 <Badge className={cn("absolute top-3 right-3 text-white", statusColors[currentContact.status])}>
                    {currentContact.status}
                </Badge>
            ) : null}

            <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isEditing ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4" /></Button>
                ) : (
                    <>
                        <Button variant="default" size="icon" className="h-8 w-8" onClick={handleSave}><Save className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}><X className="h-4 w-4" /></Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Delete Contact?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the contact for {initialContact.name}.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}
            </div>

            <CardHeader>
                {isEditing ? (
                    <Input name="name" value={editedContact.name} onChange={handleInputChange} placeholder="Name" className="text-xl font-semibold"/>
                ) : (
                    <CardTitle className="text-xl font-semibold text-primary pr-24">{currentContact.name}</CardTitle>
                )}
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
                 {isEditing ? (
                    <div className="space-y-2">
                         <div className="flex items-center gap-2">
                             <Linkedin className="h-4 w-4 text-muted-foreground" />
                             <Input name="linkedinUrl" value={editedContact.linkedinUrl} onChange={handleInputChange} placeholder="LinkedIn Profile URL" />
                         </div>
                        <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <Input name="companies" value={editedContact.companies} onChange={handleInputChange} placeholder="Companies (comma-separated)" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <Input name="positions" value={editedContact.positions} onChange={handleInputChange} placeholder="Positions (comma-separated)" />
                        </div>
                         <div className="flex items-center gap-2">
                             <Award className="h-4 w-4 text-muted-foreground" />
                             <Textarea name="certifications" value={editedContact.certifications} onChange={handleInputChange} placeholder="Certifications (comma-separated)" rows={2}/>
                         </div>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <Input name="college" value={editedContact.college} onChange={handleInputChange} placeholder="College/University" />
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-muted-foreground font-medium">Status:</span>
                             <Select value={editedContact.status} onValueChange={handleStatusChange}>
                                 <SelectTrigger className="flex-1">
                                     <SelectValue placeholder="Status" />
                                 </SelectTrigger>
                                 <SelectContent>
                                     {(Object.keys(statusColors) as ContactStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                 </SelectContent>
                             </Select>
                         </div>
                    </div>
                ) : (
                    <>
                        {currentContact.linkedinUrl && <div className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-muted-foreground" /><Link href={currentContact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn Profile</Link></div>}
                        {currentContact.companies && <div className="flex items-start gap-2"><Building className="h-4 w-4 text-muted-foreground mt-1" /><p><span className="font-semibold">Companies:</span> {currentContact.companies}</p></div>}
                        {currentContact.positions && <div className="flex items-start gap-2"><Briefcase className="h-4 w-4 text-muted-foreground mt-1" /><p><span className="font-semibold">Positions:</span> {currentContact.positions}</p></div>}
                        {currentContact.certifications && <div className="flex items-start gap-2"><Award className="h-4 w-4 text-muted-foreground mt-1" /><p><span className="font-semibold">Certs:</span> {currentContact.certifications}</p></div>}
                        {currentContact.college && <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-muted-foreground" /><p><span className="font-semibold">Education:</span> {currentContact.college}</p></div>}
                    </>
                )}
            </CardContent>
        </Card>
    );
}


export default function NetworkingSection() {
    const { contacts, addContact, updateContact, deleteContact } = useNetworkingData();
    const { toast } = useToast();

    const handleAddContact = () => {
        const newContact: Omit<NetworkingContact, 'id'> = {
            name: "New Contact",
            linkedinUrl: "",
            companies: "",
            positions: "",
            certifications: "",
            college: "",
            status: 'Not Contacted',
        };
        addContact(newContact);
        toast({ title: "New Contact Added", description: "Click the pencil icon to edit details." });
    };

    return (
        <SectionWrapper
            id="networking"
            title="Networking Tracker"
            subtitle="A private list of professional contacts to reach out to."
            className="bg-secondary"
            headerActions={
                <Button variant="outline" size="sm" onClick={handleAddContact}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Contact
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {contacts.map(contact => (
                    <ContactCard key={contact.id} contact={contact} onSave={updateContact} onDelete={deleteContact} />
                ))}
            </div>
             {contacts.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    <p>Your networking list is empty.</p>
                    <p>Click "Add Contact" to start building your list.</p>
                </div>
            )}
        </SectionWrapper>
    );
}
