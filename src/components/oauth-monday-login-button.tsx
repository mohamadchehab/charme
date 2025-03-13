import Link from "next/link"
import { Button } from "./ui/button"

const OAuthMondayLoginButton = () => {

    const redirectUri = process.env.NODE_ENV === 'production' 
        ? process.env.MONDAY_PROD_REDIRECT_URI 
        : process.env.MONDAY_DEV_REDIRECT_URI;
    const authUrl = `https://auth.monday.com/oauth2/authorize?client_id=5f5839c00d6eac2dcfa54e962d7c4786&redirect_uri=${redirectUri}`;

    return (
        <Link href={authUrl}>
            <Button variant="outline" className="cursor-pointer">Connect</Button>
        </Link>
    );
}

export default OAuthMondayLoginButton