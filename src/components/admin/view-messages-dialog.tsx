
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMessages } from '@/context/message-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ViewMessagesDialog({ children }: { children: React.ReactNode }) {
  const { messages, deleteMessage, markAllAsRead } = useMessages();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      markAllAsRead();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Inbox className="h-6 w-6" />
            Visitor Messages
          </DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <Card key={msg.id} className="relative group">
                     {!msg.isRead && (
                        <span className="absolute top-2 left-2 h-2 w-2 rounded-full bg-accent" title="New Message"></span>
                     )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteMessage(msg.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex justify-between items-center">
                        <span>{msg.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                        </span>
                      </CardTitle>
                      <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline">
                        {msg.email}
                      </a>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{msg.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Inbox className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-semibold">Your inbox is empty</h3>
                <p className="text-sm">Messages from your visitors will appear here.</p>
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
