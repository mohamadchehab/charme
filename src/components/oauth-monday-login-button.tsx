import Link from "next/link"
import { Button } from "./ui/button"

const OAuthMondayLoginButton = () => {

    const authUrl = `https://auth.monday.com/oauth2/authorize?client_id=5f5839c00d6eac2dcfa54e962d7c4786`;

    return (
        <Link href={authUrl}>
            <Button variant="outline" className="cursor-pointer">Connect</Button>
        </Link>
    );
}

export default OAuthMondayLoginButton