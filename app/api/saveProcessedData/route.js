import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Transcription from '@/models/Transcription';

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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}