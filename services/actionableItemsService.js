import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const extractActionableItems = async (summary) => {
  try {
    console.log('Extracting actionable items...');

    const prompt = `Extract actionable tasks from the following summary:
    ${summary}

    Format each task as "**[Assigned To]**: [Task Description]".`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const actionItemsText = completion.choices[0].message.content;
    const actionItems = extractActionItems(actionItemsText);
    console.log('Extracted Action Items:', actionItems);

    return { actionItems };
  } catch (error) {
    console.error('Error in actionableItemsService:', error);
    throw error;
  }
};

// Function to extract action items
function extractActionItems(notes) {
  const actionItems = [];
  const actionRegex = /\*\*(.*?)\*\*: (.*)/g;

  let match;
  while ((match = actionRegex.exec(notes)) !== null) {
    actionItems.push({
      task: match[2].trim(),
      assignedTo: match[1].trim(),
      dueDate: new Date(),
      status: 'Pending',
    });
  }

  return actionItems;
}