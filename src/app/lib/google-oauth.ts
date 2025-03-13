import { google } from "googleapis";

//let's exchange the code for an access token
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);
export default oauth2Client;