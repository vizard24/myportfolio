"use client";

import { AuthTest } from '@/components/admin/auth-test';
import { AITest } from '@/components/admin/ai-test';
import { PermissionsTest } from '@/components/admin/permissions-test';
import { DataDebug } from '@/components/admin/data-debug';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">System Testing Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Test authentication, permissions, data persistence, and AI integration
          </p>
        </div>
        
        <Tabs defaultValue="auth" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="data">Data Debug</TabsTrigger>
            <TabsTrigger value="ai">AI Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="auth" className="space-y-4">
            <AuthTest />
          </TabsContent>
          
          <TabsContent value="permissions" className="space-y-4">
            <PermissionsTest />
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <DataDebug />
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-4">
            <AITest />
          </TabsContent>
        </Tabs>
        
        <div className="text-center">
          <a 
            href="/" 
            className="text-primary hover:underline"
          >
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}