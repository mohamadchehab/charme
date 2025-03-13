import { NextResponse } from 'next/server';
import  oauth2Client  from '../../../lib/google-oauth'
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.json({ error: 'Google OAuth Error: ' + error });
      }
    
    if (!code) {
        return NextResponse.json({ error: 'Authorization code not found' });
    }

    //let's exchange the code for an access token
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log(tokens);
        //this stores the token in the oauth2Client
        //oauth2Client.setCredentials(tokens);        
        //store the token in a cookie or a database
        (await cookies()).set({
            name: 'google_access_token',
            value: tokens.access_token || '',  // the access token
            httpOnly: true,  // for security, the cookie is accessible only by the server
            secure: process.env.NODE_ENV === 'production',  // send cookie over HTTPS only in production
            path: '/',  // cookie is available on every route
            maxAge: 60 * 60 * 24 * 7,  // 1 week
        });

        return NextResponse.redirect(new URL('/dashboard', req.url));

    } catch (error) {
        return NextResponse.json({ error: 'Failed to exchange code for access token' + error });
    }

}