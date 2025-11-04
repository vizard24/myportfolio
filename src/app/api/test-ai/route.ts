import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if API key is available
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google AI API key not configured. Please set GOOGLE_API_KEY or GEMINI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Import and use the AI service
    try {
      const { ai } = await import('@/ai/genkit');
      
      const response = await ai.generate({
        prompt: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      });

      return NextResponse.json({
        success: true,
        response: response.text,
        model: 'googleai/gemini-2.0-flash',
        apiKeyStatus: 'valid'
      });

    } catch (aiError: any) {
      console.error('AI generation error:', aiError);
      
      // Handle specific AI errors
      if (aiError.message?.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Google AI API key configuration.' },
          { status: 401 }
        );
      }
      
      if (aiError.message?.includes('quota')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please check your Google Cloud billing and quotas.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `AI service error: ${aiError.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Test AI API error:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}