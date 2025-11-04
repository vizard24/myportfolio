"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader, Brain, CheckCircle, XCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AITest() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testPrompt, setTestPrompt] = useState('Write a brief professional summary for a full-stack developer with 5 years of experience.');
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');

  const checkAPIKey = () => {
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (googleApiKey || geminiApiKey) {
      setApiKeyStatus('valid');
      return true;
    } else {
      setApiKeyStatus('invalid');
      return false;
    }
  };

  const testAI = async () => {
    if (!checkAPIKey()) {
      setError('API key not configured. Please check your environment variables.');
      toast({
        title: "Configuration Error",
        description: "Google AI API key is not configured",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      // Test the AI by making a simple request
      const testResponse = await fetch('/api/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: testPrompt,
        }),
      });

      if (!testResponse.ok) {
        throw new Error(`HTTP ${testResponse.status}: ${testResponse.statusText}`);
      }

      const data = await testResponse.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResponse(data.response || 'AI responded successfully but with empty content.');
      setApiKeyStatus('valid');
      
      toast({
        title: "AI Test Successful",
        description: "Google AI is working correctly!",
      });

    } catch (error: any) {
      console.error('AI test error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      setError(errorMessage);
      setApiKeyStatus('invalid');
      
      toast({
        title: "AI Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (apiKeyStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (apiKeyStatus) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">API Key Valid</Badge>;
      case 'invalid':
        return <Badge className="bg-red-100 text-red-800">API Key Invalid</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown Status</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Configuration Test
        </CardTitle>
        <CardDescription>
          Test the Google AI integration and API key configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">API Key Status</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Environment Variables Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Expected Environment Variables:</strong></p>
          <p>• GOOGLE_API_KEY or GEMINI_API_KEY in .env.local</p>
          <p>• Current key: {process.env.GOOGLE_API_KEY ? 'GOOGLE_API_KEY set' : process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY set' : 'No key found'}</p>
        </div>

        {/* Test Prompt */}
        <div className="space-y-2">
          <Label htmlFor="test-prompt">Test Prompt</Label>
          <Textarea
            id="test-prompt"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Enter a prompt to test the AI..."
            rows={3}
          />
        </div>

        {/* Test Button */}
        <Button 
          onClick={testAI} 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Testing AI...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Test AI Integration
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">AI Response</span>
            </div>
            <p className="text-sm text-green-700 whitespace-pre-wrap">{response}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Troubleshooting:</strong></p>
          <p>1. Make sure .env.local file exists with GOOGLE_API_KEY</p>
          <p>2. Restart both development servers (npm run dev & npm run genkit:dev)</p>
          <p>3. Check that the API key is valid and has Gemini API access</p>
          <p>4. Verify the API key in Google Cloud Console</p>
        </div>
      </CardContent>
    </Card>
  );
}