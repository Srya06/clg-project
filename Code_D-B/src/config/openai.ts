import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const isGemini = process.env.AI_PROVIDER === 'gemini';

if (!process.env.OPENAI_API_KEY && !isGemini) {
  console.warn('Warning: AI_PROVIDER is openai but OPENAI_API_KEY is not set');
}

// Minimal interface that mirrors the OpenAI chat.completions.create shape
// so the rest of the codebase can treat both clients identically.
interface Message {
  role: string;
  content: string;
}

interface ResponseFormat {
  type: string;
}

interface CompletionParams {
  model: string;
  messages: Message[];
  response_format?: ResponseFormat;
}

interface AiClient {
  chat: {
    completions: {
      create: (params: CompletionParams) => Promise<{
        choices: { message: { content: string } }[];
      }>;
    };
  };
}

let aiClient: AiClient;

if (isGemini) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy');

  aiClient = {
    chat: {
      completions: {
        create: async ({ model: _model, messages, response_format }) => {
          const geminiModel = process.env.AI_MODEL || 'gemini-2.5-flash';
          const aiModel = genAI.getGenerativeModel({
            model: geminiModel,
            generationConfig: {
              responseMimeType:
                response_format?.type === 'json_object'
                  ? 'application/json'
                  : 'text/plain',
            },
          });

          const fullPrompt = messages
            .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
            .join('\n');

          const result = await aiModel.generateContent(fullPrompt);
          const responseText = result.response.text();

          return {
            choices: [{ message: { content: responseText } }],
          };
        },
      },
    },
  };
} else {
  aiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
  }) as unknown as AiClient;
}

export default aiClient;
