"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader } from 'lucide-react';
import { formatDocument, type FormattedDocument } from '@/ai/flows/document-formatter-flow';

interface EnhancedDocumentDisplayProps {
  content: string;
  documentType: 'resume' | 'cover-letter';
  className?: string;
}

export function EnhancedDocumentDisplay({ content, documentType, className }: EnhancedDocumentDisplayProps) {
  const [formattedDoc, setFormattedDoc] = useState<FormattedDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const formatContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const formatted = await formatDocument(content, documentType);
        setFormattedDoc(formatted);
      } catch (err) {
        console.error('Failed to format document:', err);
        setError('Failed to format document');
        // Fallback to basic parsing
        setFormattedDoc(parseContentBasic(content, documentType));
      } finally {
        setIsLoading(false);
      }
    };

    formatContent();
  }, [content, documentType]);

  // Fallback basic parsing if AI fails
  const parseContentBasic = (content: string, type: 'resume' | 'cover-letter'): FormattedDocument => {
    const lines = content.split('\n').filter(line => line.trim());
    const sections: FormattedDocument['sections'] = [];
    
    let currentSection = {
      title: type === 'resume' ? 'Resume' : 'Cover Letter',
      type: 'other' as const,
      content: [] as any[]
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Detect headers
      if (/^[A-Z\s]+:?$/.test(trimmedLine) || 
          ['EXPERIENCE', 'EDUCATION', 'SKILLS', 'CONTACT', 'SUMMARY'].some(section => 
            trimmedLine.toUpperCase().includes(section))) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine.replace(':', ''),
          type: 'other' as const,
          content: []
        };
      } else {
        currentSection.content.push({
          type: 'paragraph' as const,
          text: trimmedLine
        });
      }
    }

    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }

    return { sections };
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">AI is formatting your document...</span>
      </div>
    );
  }

  if (error || !formattedDoc) {
    return (
      <div className={`p-4 text-sm text-muted-foreground ${className}`}>
        <pre className="whitespace-pre-wrap font-mono">{content}</pre>
      </div>
    );
  }

  return (
    <div className={`space-y-6 font-sans ${className}`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Header with name and contact */}
      {formattedDoc.name && (
        <div className="text-center space-y-3 pb-4 border-b border-slate-200">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            {formattedDoc.name}
          </h1>
          {formattedDoc.contact && (
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
              {formattedDoc.contact.email && (
                <span className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  <span className="font-medium">{formattedDoc.contact.email}</span>
                </span>
              )}
              {formattedDoc.contact.phone && (
                <span className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="font-medium">{formattedDoc.contact.phone}</span>
                </span>
              )}
              {formattedDoc.contact.location && (
                <span className="flex items-center bg-orange-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  <span className="font-medium">{formattedDoc.contact.location}</span>
                </span>
              )}
              {formattedDoc.contact.linkedin && (
                <span className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  <span className="font-medium">LinkedIn</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      {formattedDoc.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-3">
          {/* Section Header */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
                {section.title}
              </h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent"></div>
          </div>

          {/* Section Content */}
          <div className="space-y-3 pl-4">
            {section.content.map((item, itemIndex) => (
              <div key={itemIndex} className="space-y-1">
                {item.type === 'job-title' && (
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {item.text}
                  </h3>
                )}
                
                {item.type === 'company' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                    <p className="text-base font-semibold text-blue-700">
                      {item.text}
                    </p>
                  </div>
                )}
                
                {item.type === 'date' && (
                  <p className="text-sm text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded inline-block mb-2">
                    {item.text}
                  </p>
                )}
                
                {item.type === 'bullet' && (
                  <div className="flex items-start space-x-3 ml-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                )}
                
                {item.type === 'skill-category' && (
                  <div className="mb-3">
                    <Badge variant="secondary" className="font-semibold bg-blue-100 text-blue-800 px-3 py-1">
                      {item.text}
                    </Badge>
                  </div>
                )}
                
                {item.type === 'paragraph' && (
                  <p className={`text-sm leading-relaxed mb-2 ${
                    item.emphasis === 'bold' 
                      ? 'font-bold text-slate-900' 
                      : item.emphasis === 'italic'
                      ? 'italic text-slate-600 font-medium'
                      : 'text-slate-700'
                  }`}>
                    {item.text}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {sectionIndex < formattedDoc.sections.length - 1 && (
            <Separator className="my-6" />
          )}
        </div>
      ))}
    </div>
  );
}