'use server';

import oauth2Client from "@/app/lib/google-oauth";
import { google } from "googleapis";
import { cookies } from "next/headers";
const API_KEY = process.env.GOOGLE_API_KEY;

export async function disconnect() {
 await oauth2Client.revokeCredentials()
}

export async function getUserEmail() {

    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("google_access_token")?.value;
      oauth2Client.setCredentials({ access_token: accessToken });
      const peopleService =  google.people({ version: 'v1', auth: oauth2Client });

        
  const res = await peopleService.people.get({
    resourceName: 'people/me',
    personFields: 'emailAddresses',
    });
    
    const emailAddresses = res.data.emailAddresses;
    
    if (emailAddresses && emailAddresses.length > 0) {
    return emailAddresses[0].value;
    } else {
    return null;
    }
    } catch (error) {
      console.error('Error getting user email:', error);
      return '';
    }
  
 
} 