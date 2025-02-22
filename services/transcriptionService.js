import { AssemblyAI } from 'assemblyai';

const assemblyai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

// Define transcription percentage based on usage count
const TRANSCRIPTION_LIMITS = {
  Starter: 0.3, // 30% transcript if limit exceeded
  Pro: 0.7,     // 70% transcript if limit exceeded
  Elite: 1,     // No limit on transcription
};

export const transcribeVideo = async (userId, videoId, videoUrl, tier, usageCount) => {
  try {
    console.log('Starting transcription...');
    console.log('Input parameters:', { userId, videoId, videoUrl, tier, usageCount });

    // Validate tier
    if (!TRANSCRIPTION_LIMITS[tier]) {
      throw new Error(`Invalid tier: ${tier}. Allowed tiers are Starter, Pro, and Elite.`);
    }

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

    // Transcribe video using AssemblyAI
    console.log('Transcribing video...');
    const fullTranscript = await assemblyai.transcripts.transcribe({ audio_url: videoUrl });
    const transcriptText = limitTranscript(fullTranscript.text, transcriptLimit);
    console.log('Processed Transcript:', transcriptText);

    return { transcript: transcriptText, message };
  } catch (error) {
    console.error('Error in transcriptionService:', error);
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