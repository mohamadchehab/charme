'use client'
import oauth2Client from "@/app/lib/google-oauth"
import { Button } from "./ui/button"

const DisconnectButton = () => {
    return (
        <Button onClick={() => oauth2Client.revokeCredentials()} variant='outline'>Disconnect</Button>
    )
}

export default DisconnectButton