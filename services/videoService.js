import { OpenAI } from 'openai';
import { AssemblyAI } from 'assemblyai';
import Transcription from '../models/Transcription';

// Initialize AI clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const assemblyai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

// Define limits for each tier
const TIER_LIMITS = {
  Starter: 3,
  Pro: 8,
  Elite: 12,
};

// Define transcription percentage based on usage count
const TRANSCRIPTION_LIMITS = {
  Starter: 0.3, // 50% transcript if limit exceeded
  Pro: 0.7,     // 80% transcript if limit exceeded
  Elite: 1,     // No limit on transcription
};

export const processVideo = async (userId, videoId, videoUrl, tier, usageCount) => {
  try {
    console.log('Starting video processing...');
    console.log('Input parameters:', { userId, videoId, videoUrl, tier, usageCount });

    // Determine transcript percentage based on usageCount
    const transcriptLimit = usageCount < 0 ? TRANSCRIPTION_LIMITS[tier] : 1;
    console.log(`Transcription Limit: ${transcriptLimit * 100}%`);

    // Set message based on reduction
    let message = 'Processing completed successfully.';
    if (usageCount < 0) {
      if (tier === 'Starter') {
        message = 'Your daily free AI processing limit has been reached. Transcript processing is reduced by 30% for now. Full processing resets in 24 hours.';
      } else if (tier === 'Pro') {
        message = 'You have exceeded your AI processing quota. Transcript processing is reduced by 70%. Upgrade to Elite for unlimited processing.';
      }
    }

    // Step 1: Transcribe video using AssemblyAI
    console.log('Transcribing video using AssemblyAI...');
    const fullTranscript = await assemblyai.transcripts.transcribe({ audio_url: videoUrl });
    const transcriptText = limitTranscript(fullTranscript.text, transcriptLimit);
    console.log('Processed Transcript:', transcriptText);

    // Step 2: Summarize and extract tasks using OpenAI GPT-4
    console.log('Summarizing transcript using GPT-4o...');
    const prompt = `Summarize the following meeting transcript and extract actionable tasks:
    ${transcriptText}

    Provide a structured output with two sections:
    1. **Meeting Summary**
    2. **Actionable Tasks** (format each task as "**[Assigned To]**: [Task Description]")`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const summary = completion.choices[0].message.content;
    console.log('Summary:', summary);

    // Step 3: Extract Action Items with tier-based limits
    const actionItems = extractActionItems(summary, TIER_LIMITS[tier]);
    console.log('Extracted Action Items:', actionItems);

    // Step 4: Save the results to the database
    console.log('Saving results to the database...');
    const transcription = new Transcription({
      userId,
      videoId,
      transcript: transcriptText,
      notes: summary,
      actionItems,
    });

    //await transcription.save();
    //console.log('Results saved to the database:', transcription);

    return { transcription, message };
  } catch (error) {
    console.error('Error in videoService:', error);
    throw error;
  }
};

// Function to limit transcript based on tier limits
function limitTranscript(transcript, limitPercentage) {
  if (limitPercentage === 1) return transcript; // Full transcript

  const words = transcript.split(' ');
  const limitedWords = words.slice(0, Math.floor(words.length * limitPercentage));
  return limitedWords.join(' ') + '...'; // Indicate truncation
}

// Function to extract action items with tier-based limits
function extractActionItems(notes, taskLimit) {
  const actionItems = [];
  const actionRegex = /\*\*(.*?)\*\*: (.*)/g; // Matches "**Name**: Task Description"
  
  let match;
  while ((match = actionRegex.exec(notes)) !== null) {
    if (actionItems.length < taskLimit) {
      actionItems.push({
        task: match[2].trim(),
        assignedTo: match[1].trim(),
        dueDate: new Date(), // Default due date (can be customized)
        status: 'Pending',
      });
    } else {
      break; // Stop if task limit is reached
    }
  }

  return actionItems;
}
