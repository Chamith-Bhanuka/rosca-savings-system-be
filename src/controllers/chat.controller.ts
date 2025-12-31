import { Request, Response } from 'express';
import { generateAIResponse } from '../services/aiService';
import { searchGroupTool } from '../services/agent.tools';

export const chatWithAgent = async (req: Request, res: Response) => {
  const { message, history } = req.body;

  try {
    const aiResult = await generateAIResponse(history, message);

    if (aiResult.toolCall) {
      console.log(`🤖 Agent calling tool:`, aiResult.toolCall.name);

      if (aiResult.toolCall.name === 'search_group') {
        const args = aiResult.toolCall.args;
        const data = await searchGroupTool(args);

        const summaryPrompt = `
          The user asked: "${message}".
          
          I ran the search_group tool and found these results:
          ${JSON.stringify(data)}

          Please answer the user's question nicely using this data.
          If the list is empty, say "I couldn't find any groups matching that."
        `;

        const summary = await generateAIResponse(history, summaryPrompt, []);

        return res.json({ reply: summary.text });
      }
    }

    return res.json({ reply: aiResult.text });
  } catch (error: any) {
    console.error('Chat Error:', error.message);
    return res.status(500).json({
      message: 'AI is offline. Check backend logs.',
    });
  }
};
