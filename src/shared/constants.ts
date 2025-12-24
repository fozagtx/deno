import { AIModel } from './types';

export const AI_MODELS: AIModel[] = [
  {
    id: 'moonshotai/Kimi-K2-Instruct',
    name: 'Kimi K2',
    provider: 'Moonshot AI',
    type: 'text',
    supportsImage: false,
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-0528',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    type: 'text',
    supportsImage: false,
  },
  {
    id: 'Qwen/Qwen2.5-VL-72B-Instruct',
    name: 'Qwen 2.5 VL',
    provider: 'Alibaba',
    type: 'vision',
    supportsImage: true,
  },
  {
    id: 'mistralai/Pixtral-12B-2409',
    name: 'Pixtral 12B',
    provider: 'Mistral AI',
    type: 'vision',
    supportsImage: true,
  },
];

export const SYSTEM_PROMPT = `You are Deno, a helpful AI assistant for browsing and understanding web content. You help users understand, summarize, and analyze the webpage they're currently viewing.

You have access to the current webpage content. Use this context to provide helpful, relevant responses.

Guidelines:
- Be concise and direct in your responses
- Reference specific content from the page when relevant
- Use plain text formatting - avoid asterisks, markdown symbols, or special formatting
- Use simple dashes for lists if needed
- Answer questions accurately based on the page content
- If the user asks about something not on the page, let them know`;

export const QUICK_ACTIONS = [
  { label: 'Summarize this page', prompt: 'Give me a brief summary of what this page is about.' },
  { label: 'Key points', prompt: 'What are the main points or takeaways from this page?' },
  { label: 'Explain simply', prompt: 'Explain the content of this page in simple terms.' },
  { label: 'Questions to ask', prompt: 'What are some good questions I should consider about this content?' },
];
