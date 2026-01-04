import axios from 'axios';
import { toolSchema } from './agent.tools';

interface AIResponse {
  text: string;
  toolCall?: {
    name: string;
    args: any;
  };
}

const callGoogleGemini = async (
  messages: any[],
  tools: any[]
): Promise<AIResponse> => {
  const API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const geminiContents = messages.map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user', // Gemini uses 'model', generic uses 'assistant'
    parts: [{ text: m.content }],
  }));

  try {
    const res = await axios.post(
      `${API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: geminiContents,
        tools: [{ function_declarations: tools }],
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const candidate = res.data.candidates?.[0]?.content?.parts?.[0];

    if (candidate?.functionCall) {
      return {
        text: '',
        toolCall: {
          name: candidate.functionCall.name,
          args: candidate.functionCall.args,
        },
      };
    }

    return { text: candidate?.text || 'No response' };
  } catch (error: any) {
    console.error('Gemini Error:', error.response?.data || error.message);
    throw error;
  }
};

const callOllama = async (
  messages: any[],
  tools: any[]
): Promise<AIResponse> => {
  const API_URL = `${process.env.OLLAMA_BASE_URL}/api/chat`;

  const payload = {
    model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
    messages: messages,
    stream: false,
    tools: tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    })),
  };

  try {
    const res = await axios.post(API_URL, payload);
    const message = res.data.message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      const tool = message.tool_calls[0].function;
      return {
        text: '',
        toolCall: {
          name: tool.name,
          args: tool.arguments,
        },
      };
    }

    return { text: message.content };
  } catch (error: any) {
    console.error(
      "Ollama Error (Make sure 'ollama serve' is running!):",
      error.message
    );
    throw error;
  }
};

export const generateAIResponse = async (
  history: any[],
  newMessage: string,
  customTools?: any[]
) => {
  const provider = process.env.AI_PROVIDER || 'google';

  const toolsToUse = customTools !== undefined ? customTools : toolSchema;

  const fullMessages = [
    ...history.map((h: any) => ({
      role: h.role === 'model' ? 'assistant' : h.role,
      content: h.parts?.[0]?.text || h.text,
    })),
    { role: 'user', content: newMessage },
  ];

  if (provider === 'ollama') {
    return await callOllama(fullMessages, toolsToUse);
  } else {
    return await callGoogleGemini(fullMessages, toolsToUse);
  }
};
