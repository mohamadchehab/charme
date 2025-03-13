import Link from "next/link";
import { Button } from "./ui/button";
import oauth2Client from "@/app/lib/google-oauth";

export function SidebarGoogleLogin() {
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
  return (
    <Link href={authUrl}>
    <Button

      variant="outline"
      className="w-full flex items-center gap-2 justify-start"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
      </svg>
      Login with Google
    </Button>
    </Link>
  );
} 