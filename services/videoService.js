import { OpenAI } from 'openai';
import { AssemblyAI } from 'assemblyai';
import Transcription from '../models/Transcription';

// Initialize AI clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const assemblyai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

export const processVideo = async (userId, videoId, videoUrl) => {
  try {
    console.log('Starting video processing...');
    console.log('Input parameters:', { userId, videoId, videoUrl });

    // Step 1: Transcribe video using AssemblyAI
    console.log('Transcribing video using AssemblyAI...');
    const transcript = await assemblyai.transcripts.transcribe({ audio_url: videoUrl });
    console.log('Transcript:', transcript.text);

    // Step 2: Summarize and extract tasks using OpenAI GPT-4
    console.log('Summarizing transcript using GPT-4o...');
    const prompt = `Summarize the following meeting transcript and extract actionable tasks:
    ${transcript.text}

    Provide a structured output with two sections:
    1. **Meeting Summary**
    2. **Actionable Tasks** (format each task as "**[Assigned To]**: [Task Description]")`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const summary = completion.choices[0].message.content;
    console.log('Summary:', summary);

    // Step 3: Extract Action Items from the Summary
    const actionItems = extractActionItems(summary);
    console.log('Extracted Action Items:', actionItems);

    // Step 4: Save the results to the database
    console.log('Saving results to the database...');
    const transcription = new Transcription({
      userId,
      videoId,
      transcript: transcript.text,
      notes: summary,
      actionItems,
    });

    //await transcription.save();
    //console.log('Results saved to the database:', transcription);

    return transcription;
  } catch (error) {
    console.error('Error in videoService:', error);
    throw error;
  }
};

// Function to Extract Action Items from Summary
function extractActionItems(notes) {
  const actionItems = [];
  const actionRegex = /\*\*(.*?)\*\*: (.*)/g; // Matches "**Name**: Task Description"

  let match;
  while ((match = actionRegex.exec(notes)) !== null) {
    actionItems.push({
      task: match[2].trim(),
      assignedTo: match[1].trim(),
      dueDate: new Date(), // Default due date (can be customized)
      status: 'Pending',
    });
  }

  return actionItems;
}
