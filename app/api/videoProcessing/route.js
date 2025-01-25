import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { processVideo } from '@/services/videoService';

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

// Handle POST request
export async function POST(request) {
  try {
    console.log('Request received at /api/video/process'); // Debugging: Log request

    // Parse the request body
    const body = await request.json();
    console.log('Request Body:', body); // Debugging: Log request body

    const { userId, videoId, videoUrl } = body;

    // Validate required fields
    if (!userId || !videoId || !videoUrl) {
      console.error('Missing required fields:', { userId, videoId, videoUrl }); // Debugging: Log missing fields
      let response = NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
      return setCORSHeaders(response); // Apply CORS headers
    }

    console.log('Connecting to database...'); // Debugging: Log database connection
    await dbConnect();
    console.log('Database connected successfully'); // Debugging: Log successful connection

    // Process the video
    console.log('Starting video processing...'); // Debugging: Log start of processing
    const result = await processVideo(userId, videoId, videoUrl);
    console.log('Video processing completed:', result); // Debugging: Log processing result

    // Return the result
    let response = NextResponse.json(result, { status: 200 });
    return setCORSHeaders(response); // Apply CORS headers
  } catch (error) {
    console.error('Error processing video:', error); // Debugging: Log error
    let response = NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
    return setCORSHeaders(response); // Apply CORS headers
  }
}