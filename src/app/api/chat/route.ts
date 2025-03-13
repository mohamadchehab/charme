import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { tools } from '@/ai/tools';

export async function POST(request: Request) {
  const { messages, webSearchEnabled} = await request.json();
  console.log(webSearchEnabled)

  const result = streamText({
    model: openai.responses('gpt-4o-mini'),
    system: 'You are a friendly assistant!',
    messages,
    maxSteps: 5,
    tools: {
      ...tools,
      web_search_preview: openai.tools.webSearchPreview()
    }
  });

  return result.toDataStreamResponse();
}