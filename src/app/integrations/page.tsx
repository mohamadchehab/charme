

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SidebarGoogleLogin } from '@/components/sidebar-google-login';
import { getUserEmail } from '../actions';
import DisconnectButton from '@/components/disconnect-button';

const Integrations = async () => {
   const userEmail = await getUserEmail()

    return (
        <div className='mx-4'>
            <div className="flex items-center mb-6 ">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <p className="font-bold text-2xl">Integrations</p>
            </div>
            
            <div className="w-full border rounded-full p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 mr-3" />
                    <div>
                        <p className="font-medium">Google</p>
                        {userEmail != '' && <p className="text-sm text-muted-foreground">{userEmail}</p>}
                    </div>
                </div>
                {userEmail != '' ? (
                  <DisconnectButton />
                ) : (
                <SidebarGoogleLogin />
                )}
            </div>
        </div>
    )
}

export default Integrations