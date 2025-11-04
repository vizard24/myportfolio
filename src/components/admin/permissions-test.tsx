"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  Database,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useAdminMode } from '@/context/admin-mode-context';
import { firestoreService } from '@/lib/firestore-service';
import { useToast } from '@/hooks/use-toast';

interface PermissionTest {
  name: string;
  description: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
  icon: React.ReactNode;
}

export function PermissionsTest() {
  const { user } = useAuth();
  const { isAdminMode } = useAdminMode();
  const { toast } = useToast();
  
  const [tests, setTests] = useState<PermissionTest[]>([
    {
      name: 'User Authentication',
      description: 'Check if user is properly authenticated',
      status: 'pending',
      icon: <User className="h-4 w-4" />
    },
    {
      name: 'Admin Mode',
      description: 'Verify admin mode is active',
      status: 'pending',
      icon: <Shield className="h-4 w-4" />
    },
    {
      name: 'Read Portfolio Data',
      description: 'Test reading user portfolio data',
      status: 'pending',
      icon: <Eye className="h-4 w-4" />
    },
    {
      name: 'Write Portfolio Data',
      description: 'Test updating portfolio data',
      status: 'pending',
      icon: <Edit className="h-4 w-4" />
    },
    {
      name: 'Create Test Data',
      description: 'Test creating new data entries',
      status: 'pending',
      icon: <Plus className="h-4 w-4" />
    },
    {
      name: 'Delete Test Data',
      description: 'Test deleting data entries',
      status: 'pending',
      icon: <Trash2 className="h-4 w-4" />
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const updateTestStatus = (testName: string, status: 'success' | 'error', error?: string) => {
    setTests(prev => prev.map(test => 
      test.name === testName 
        ? { ...test, status, error }
        : test
    ));
  };

  const runPermissionTests = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run permission tests",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, error: undefined })));

    try {
      // Test 1: User Authentication
      if (user && user.email) {
        updateTestStatus('User Authentication', 'success');
      } else {
        updateTestStatus('User Authentication', 'error', 'User not properly authenticated');
      }

      // Test 2: Admin Mode
      if (isAdminMode && user.email === 'fgadedjro@gmail.com') {
        updateTestStatus('Admin Mode', 'success');
      } else {
        updateTestStatus('Admin Mode', 'error', `Admin mode: ${isAdminMode}, Email: ${user.email}`);
      }

      // Test 3: Read Portfolio Data
      try {
        const portfolioData = await firestoreService.getPortfolioData(user.uid);
        updateTestStatus('Read Portfolio Data', 'success');
      } catch (error: any) {
        updateTestStatus('Read Portfolio Data', 'error', error.message);
      }

      // Test 4: Write Portfolio Data
      try {
        const testUpdate = {
          personalInfo: {
            name: 'Test Update',
            title: 'Permission Test',
            introduction: 'Testing permissions...',
            contact: {
              email: { url: 'test@example.com', visible: true },
              linkedin: { url: '', visible: false },
              github: { url: '', visible: false },
              twitter: { url: '', visible: false },
              instagram: { url: '', visible: false },
              substack: { url: '', visible: false },
              medium: { url: '', visible: false },
              discord: { url: '', visible: false },
            },
            profilePictureUrl: '',
            profilePictureHint: '',
            resumeSummaries: []
          }
        };
        
        await firestoreService.savePortfolioData(user.uid, testUpdate);
        updateTestStatus('Write Portfolio Data', 'success');
      } catch (error: any) {
        updateTestStatus('Write Portfolio Data', 'error', error.message);
      }

      // Test 5: Create Test Data
      try {
        const testProject = {
          id: 'test-project-' + Date.now(),
          title: 'Permission Test Project',
          description: 'This is a test project for permission testing',
          imageUrl: 'https://picsum.photos/300/200',
          techStack: [{ name: 'Test Tech' }],
        };
        
        await firestoreService.addProject(user.uid, testProject);
        updateTestStatus('Create Test Data', 'success');
        
        // Test 6: Delete Test Data (clean up the test project)
        try {
          await firestoreService.deleteProject(user.uid, testProject.id);
          updateTestStatus('Delete Test Data', 'success');
        } catch (error: any) {
          updateTestStatus('Delete Test Data', 'error', error.message);
        }
        
      } catch (error: any) {
        updateTestStatus('Create Test Data', 'error', error.message);
        updateTestStatus('Delete Test Data', 'error', 'Skipped due to create failure');
      }

    } catch (error: any) {
      console.error('Permission test error:', error);
      toast({
        title: "Test Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: PermissionTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: PermissionTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Fail</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Firestore Permissions Test
        </CardTitle>
        <CardDescription>
          Test Firebase permissions and security rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <span className="text-sm font-medium">User Email:</span>
            <p className="text-sm text-muted-foreground">{user?.email || 'Not logged in'}</p>
          </div>
          <div>
            <span className="text-sm font-medium">Admin Mode:</span>
            <p className="text-sm text-muted-foreground">{isAdminMode ? 'Active' : 'Inactive'}</p>
          </div>
          <div>
            <span className="text-sm font-medium">User ID:</span>
            <p className="text-sm text-muted-foreground">{user?.uid || 'N/A'}</p>
          </div>
        </div>

        {/* Run Tests Button */}
        <Button 
          onClick={runPermissionTests} 
          disabled={isRunning || !user}
          className="w-full"
        >
          {isRunning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Run Permission Tests
            </>
          )}
        </Button>

        {/* Test Results */}
        <div className="space-y-3">
          {tests.map((test) => (
            <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {test.icon}
                <div>
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                  {test.error && (
                    <p className="text-xs text-red-600 mt-1">{test.error}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(test.status)}
                {getStatusBadge(test.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-blue-50 rounded-lg">
          <p><strong>Expected Results:</strong></p>
          <p>• All tests should pass if you're logged in as admin (fgadedjro@gmail.com)</p>
          <p>• Firestore rules have been deployed and are active</p>
          <p>• If tests fail, check the error messages for specific permission issues</p>
        </div>
      </CardContent>
    </Card>
  );
}