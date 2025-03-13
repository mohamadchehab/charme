

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { OAuthGoogleLoginButton } from '@/components/oauth-google-login-button';
import { getUserEmail } from '../actions';
import DisconnectButton from '@/components/disconnect-button';
import OAuthMondayLoginButton from '@/components/oauth-monday-login-button';
import mondayClient from '../lib/monday-oauth';

const Integrations = async () => {
    const googleUserEmail = await getUserEmail()
    const mondayUserEmail = await mondayClient.getUserEmail()
    return (
        <div className='mx-4'>
            <div className="flex items-center mb-6 ">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="mr-2 cursor-pointer">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <p className="font-bold text-2xl">Integrations</p>
            </div>
            
            <div className='flex flex-col gap-4'>
            <div className="w-full border rounded-full p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 mr-3" />
                    <div>
                        <p className="font-medium">Google</p>
                        {googleUserEmail != '' && <p className="text-sm text-muted-foreground">{googleUserEmail}</p>}
                    </div>
                </div>
                {googleUserEmail != '' ? (
                  <DisconnectButton />
                ) : (
                <OAuthGoogleLoginButton />
                )}
            </div>

            <div className="w-full border rounded-full p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <img src="https://cdn.monday.com/images/logos/monday_logo_icon.png" alt="Monday" className="w-6 h-6 mr-3" />
                    <div>
                        <p className="font-medium">Monday CRM</p>
                        {mondayUserEmail != '' && <p className="text-sm text-muted-foreground">{mondayUserEmail}</p>}
                    </div>
                </div>
                {mondayUserEmail != '' ? (
                  <DisconnectButton />
                ) : (
                <OAuthMondayLoginButton />
                )}
            </div>
        </div>
        </div>
    )
}

export default Integrations