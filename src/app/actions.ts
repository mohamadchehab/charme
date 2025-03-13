'use server';

import oauth2Client from "@/app/lib/google-oauth";

import { togetherai } from '@ai-sdk/togetherai';

import { experimental_generateImage } from "ai";
const API_KEY = process.env.GOOGLE_API_KEY;


export async function runImage(topic: string): Promise<string> {
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


export async function getUserEmail() {
  try {
    const tokenInfo = await oauth2Client.getTokenInfo(
      oauth2Client.credentials.access_token as string
    );
    return tokenInfo.email || '';
  } catch (error) {
    console.error('Error getting user email:', error);
    return '';
  }
} 