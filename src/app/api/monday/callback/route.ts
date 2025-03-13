import { NextResponse } from "next/server";
import mondayClient from "@/app/lib/monday-oauth";

const redirectUri = process.env.NODE_ENV === 'production' 
  ? process.env.MONDAY_PROD_REDIRECT_URI 
  : process.env.MONDAY_DEV_REDIRECT_URI 

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        console.error('OAuth error:', error);
        return NextResponse.redirect(new URL('/error?source=monday', req.url));
    }

    if (!code) {
        console.error('No code received from Monday.com');
        return NextResponse.redirect(new URL('/error?source=monday&reason=no_code', req.url));
    }

    try {
        // Exchange the authorization code for an access token
        const tokenResponse = await fetch('https://auth.monday.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.MONDAY_CLIENT_ID,
                client_secret: process.env.MONDAY_CLIENT_SECRET,
                code: code,
                redirect_uri: redirectUri
            })
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.text();
            console.error('Token exchange error:', error);
            return NextResponse.redirect(new URL('/error?source=monday&reason=token_exchange', req.url));
        }

        const { access_token } = await tokenResponse.json();

        // Create response with redirect
        const response = NextResponse.redirect(new URL('/', req.url));

        // Set the cookie in the response
        await mondayClient.setAccessToken(access_token)

        return response;

    } catch (error) {
        console.error('Error during token exchange:', error);
        return NextResponse.redirect(new URL('/error?source=monday&reason=server_error', req.url));
    }
}