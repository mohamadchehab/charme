'use server';

import oauth2Client from "@/app/lib/google-oauth";

export async function getGoogleAuthUrl() {
  const SCOPE = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.appdata",
    "https://www.googleapis.com/auth/drive.photos.readonly",
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPE,
    prompt: 'consent'
  });

  return authUrl;
} 