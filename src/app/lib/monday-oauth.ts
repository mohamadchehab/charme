import { cookies } from 'next/headers';


const redirectUri = process.env.NODE_ENV === 'production' 
  ? process.env.MONDAY_PROD_REDIRECT_URI 
  : process.env.MONDAY_DEV_REDIRECT_URI;

// Monday.com OAuth client for managing access tokens
const mondayClient = {
    /**
     * Gets the access token from secure cookie storage
     */
    getAccessToken: async () => {
        const cookieStore = await cookies();
        const token = cookieStore.get('monday_access_token');
        
        if (!token) {
            return ''
        }
        
        return token.value;
    },

    /**
     * Exchanges authorization code for access token
     */
    getTokenFromCode: async (code: string) => {
        const response = await fetch('https://auth.monday.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.MONDAY_CLIENT_ID,
                client_secret: process.env.MONDAY_CLIENT_SECRET,
                code: code,
                redirect_uri: process.env.MONDAY_REDIRECT_URI
            })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for access token');
        }

        const data = await response.json();
        return data.access_token;
    },

    /**
     * Stores the access token in a secure HTTP-only cookie
     */
    setAccessToken: async (accessToken: string) => {
        const cookieStore = await cookies();
        cookieStore.set('monday_access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
    },

    /**
     * Removes the access token cookie
     */
    removeAccessToken: async () => {
        const cookieStore = await cookies();
        cookieStore.delete('monday_access_token');
    },

    /**
     * Gets the email of the authenticated Monday.com user
     */
    getUserEmail: async () => {
        const token = await mondayClient.getAccessToken();
        if (!token) {
           return ''
        }

        const response = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                query: `query { me { email } }`
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user email');
        }

        const data = await response.json();
        return data.data.me.email;
    }
};

export const getMondayAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: process.env.MONDAY_CLIENT_ID!,
    redirect_uri: redirectUri!
  });

  return `https://auth.monday.com/oauth2/authorize?${params.toString()}`;
};

export default mondayClient;

