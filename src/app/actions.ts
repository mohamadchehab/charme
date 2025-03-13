'use server';

import oauth2Client from "@/app/lib/google-oauth";

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