import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const summarizeTranscript = async (transcript) => {
  try {
    console.log('Starting summarization...');

    const prompt = `Summarize the following meeting transcript:
    ${transcript}

    Provide a structured output with a **Meeting Summary** section.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const summary = completion.choices[0].message.content;
    console.log('Summary:', summary);

    return { summary };
  } catch (error) {
    console.error('Error in summarizationService:', error);
    throw error;
  }
};