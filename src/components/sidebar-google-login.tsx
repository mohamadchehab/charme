import Link from "next/link";
import { Button } from "./ui/button";
import oauth2Client from "@/app/lib/google-oauth";

export function SidebarGoogleLogin() {
    const SCOPE = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/gmail.readonly"
    ]
  
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPE,
        prompt: 'consent'
      });
  return (
    <Link href={authUrl}>
    <Button

      variant="outline"

    >
    Connect
    </Button>
    </Link>
  );
} 