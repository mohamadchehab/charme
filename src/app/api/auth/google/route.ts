import { NextResponse } from "next/server";
import oauth2Client from "@/app/lib/google-oauth";

export async function GET() {
  try {
    const SCOPE = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.send",
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPE,
      prompt: 'consent'
    });

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Failed to generate auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication URL' },
      { status: 500 }
    );
  }
} 