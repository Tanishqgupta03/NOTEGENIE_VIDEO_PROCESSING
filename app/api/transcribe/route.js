import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { transcribeVideo } from '@/services/transcriptionService';

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

export async function POST(request) {
    try {
      console.log('Request received at /api/video/transcribe');
      const body = await request.json();
      const { userId, videoId, videoUrl, tier, usageCount } = body;
  
      // Validate required fields
      if (!userId || !videoId || !videoUrl || !tier || !usageCount) {
        console.error('Missing required fields:', { userId, videoId, videoUrl, tier, usageCount });
        let response = NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        return setCORSHeaders(response);
      }
  
      console.log('Connecting to database...');
      await dbConnect();
      console.log('Database connected successfully');
  
      // Transcribe the video
      console.log('Starting transcription...');
      const transcription = await transcribeVideo(userId, videoId, videoUrl, tier, usageCount);
      console.log('Transcription completed:', transcription);
  
      // Return the transcription result
      let response = NextResponse.json(transcription, { status: 200 });
      return setCORSHeaders(response);
    } catch (error) {
      console.error('Error transcribing video:', error);
      let response = NextResponse.json({ error: 'Failed to transcribe video' }, { status: 500 });
      return setCORSHeaders(response);
    }
  }