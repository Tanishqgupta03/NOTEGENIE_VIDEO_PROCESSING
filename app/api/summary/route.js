import { NextResponse } from 'next/server';
import { summarizeTranscript } from '@/services/summarizationService';


// Middleware to handle CORS
function setCORSHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins (Change to 'http://localhost:3000' for stricter control)
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS request (CORS preflight)
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 }); // 204 No Content
  return setCORSHeaders(response);
}

export async function POST(request, { params }) {
    try {
      console.log('Request received at /api/video/summarize');
      const body = await request.json();
      const { transcript } = body;
  
      // Validate required fields
      if (!transcript) {
        console.error('Missing required field: transcript');
        let response = NextResponse.json({ error: 'Missing required field: transcript' }, { status: 400 });
        return setCORSHeaders(response);
      }
  
      console.log('Starting summarization...');
      const summary = await summarizeTranscript(transcript);
      console.log('Summarization completed:', summary);
  
      // Return the summary result
      let response = NextResponse.json(summary, { status: 200 });
      return setCORSHeaders(response);
    } catch (error) {
      console.error('Error summarizing transcript:', error);
      let response = NextResponse.json({ error: 'Failed to summarize transcript' }, { status: 500 });
      return setCORSHeaders(response);
    }
  }