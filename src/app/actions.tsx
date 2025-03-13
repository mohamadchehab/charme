import { togetherai } from '@ai-sdk/togetherai';
import {GoogleGenAI} from '@google/genai';
import { experimental_generateImage } from "ai";
const API_KEY = process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({apiKey: API_KEY});


export async function runGemini(topic: string): Promise<string> {
  if (!API_KEY) {
    console.error("API key not found in environment variables.");
    return '';
  }


  
  const prompt = "Create an image of " + topic;

  try {

    const { image } = await experimental_generateImage({
        model: togetherai.image('black-forest-labs/FLUX.1-schnell'),
        prompt: prompt
      });
      return image.base64
  } catch (error) {
    console.error("Error generating content:", error);
    return ''
  }
}