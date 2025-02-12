import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Transcription from '@/models/Transcription';

// Function to set CORS headers
function setCORSHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins (or specify a specific origin like 'http://localhost:3000')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, videoId, transcript, notes, actionItems } = body;

    // Save the processed data to the database
    const transcription = new Transcription({
      userId,
      videoId,
      transcript,
      notes,
      actionItems,
    });

    await transcription.save();

    // Create a success response
    const response = NextResponse.json({ success: true }, { status: 200 });

    // Set CORS headers
    return setCORSHeaders(response);
  } catch (error) {
    console.error('Error saving data:', error);

    // Create an error response
    const response = NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );

    // Set CORS headers
    return setCORSHeaders(response);
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 }); // No content for OPTIONS
  return setCORSHeaders(response);
}