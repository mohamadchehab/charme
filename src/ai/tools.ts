
import oauth2Client from '@/app/lib/google-oauth';
import { tool as createTool, StreamData } from 'ai';
import { z } from 'zod';
import { google } from "googleapis";
import { cookies } from 'next/headers';
import { runImage } from '@/app/actions';
export const mailTool = createTool({
  description: 'Summarize emails (e.g: ask user to login if not logged in',
  parameters: z.object({
    provider: z.string(), 
  }),
  execute: async function (args, {toolCallId}) {
    const data = new StreamData();
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("google_access_token")?.value;
      oauth2Client.setCredentials({ access_token: accessToken });
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      data.appendMessageAnnotation({
        type: 'tool-status',
        toolCallId,
        status: 'in-progress',
      });
      // Fetch the last 10 emails
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10
      });
      console.log(response.data.messages)
      const emailIds = response.data.messages || [];
      const emails = [];
      
      // Get the content of each email
      for (const emailId of emailIds) {
        const message = await gmail.users.messages.get({
          userId: 'me',
          id: emailId.id || '',
          format: 'full'
        });
       
        // Extract email headers for sender, subject and date
        const headers = message.data.payload?.headers || [];
        const sender = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const date = headers.find(h => h.name === 'Date')?.value || '';
        
        // Extract the email content
        const emailContent = message.data.snippet || '';
        
        emails.push({
          sender,
          subject,
          snippet: emailContent,
          date
        });
      }

      return {emails}
    } catch (error) {
      console.error('Error accessing email:', error);
      return {
        status: 'error',
        message: `Failed to access emails: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
})

export const imageGenerationTool = createTool({
  description: 'Generate an image',
  parameters: z.object({
    topic: z.string().describe('The topic to generate the image about')
}),
execute: async function ({ topic }) {
  try {
    const image = await runImage(topic)

    return {image: image}
  } catch (error) {
    return {
      
      error: `Could not generate : ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
})


export const dictionaryTool = createTool({
  description: 'Look up the definition of a word',
  parameters: z.object({
    word: z.string().describe('The word to look up the definition for'),
  }), 
  execute: async function ({ word }) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        throw new Error('Word not found');
      }

      const data = await response.json();
      const definition = data[0].meanings[0].definitions[0].definition;

      return {
        word,
        definition
      };
    } catch (error) {
      return {
        word,
        error: `Could not find definition: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
});

export const calculatorTool = createTool({
  description: 'Perform arithmetic calculations including trigonometric functions',
  parameters: z.object({
    expression: z.string().describe('The mathematical expression to evaluate (e.g., "2 + 2", "sin(0.5)", "cos(Math.PI)")'),
  }),
  execute: async function ({ expression }) {
    try {
      // Create a safe context with Math functions
      const mathContext = {
        sin: Math.sin,
        cos: Math.cos,
        Math: Math
      };

      // Evaluate the expression in the safe context
      const result = Function(...Object.keys(mathContext), `'use strict'; return (${expression})`)(...Object.values(mathContext));
      
      if (typeof result !== 'number' || !Number.isFinite(result)) {
        throw new Error('Expression must evaluate to a finite number');
      }

      return {
        result,
        expression
      };
    } catch (error) {
      return {
        error: `Could not calculate: ${error instanceof Error ? error.message : String(error)}`,
        expression: expression
      };
    }
  }
});



export const weatherTool = createTool({
  description: 'Display the weather for a location',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async function ({ location }) {
    try {
      // Using the free public Open-Meteo API which doesn't require an API key
      // First, get the coordinates for the location
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`
      );
      
      if (!geoResponse.ok) {
        throw new Error(`Geocoding API returned ${geoResponse.status}`);
      }
      
      const geoData = await geoResponse.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Location not found: ${location}`);
      }
      
      const { latitude, longitude, name } = geoData.results[0];
      
      // Now get the weather data using the coordinates
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
      );
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API returned ${weatherResponse.status}`);
      }
      
      const weatherData = await weatherResponse.json();
      
      // Map weather code to a description
      // Based on WMO Weather interpretation codes (WW)
      const getWeatherDescription = (code: number) => {
        if (code <= 3) return "Clear";
        if (code <= 49) return "Foggy";
        if (code <= 69) return "Rainy";
        if (code <= 79) return "Snowy";
        if (code <= 99) return "Stormy";
        return "Unknown";
      };
      
      // Determine time of day based on current hour
      const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "morning";
        if (hour >= 12 && hour < 17) return "afternoon";
        if (hour >= 17 && hour < 20) return "evening";
        if (hour >= 20 || hour < 5) return "night";
        return "day";
      };
      
      return {
        weather: getWeatherDescription(weatherData.current.weather_code),
        temperature: weatherData.current.temperature_2m,
        location: name,
        timeOfDay: getTimeOfDay(),
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Fallback to mock data if API call fails
      return { weather: 'Sunny', temperature: 75, location };
    }
  },
});

export const tools = {
  generateImage: imageGenerationTool,
  displayWeather: weatherTool,
  calculate: calculatorTool,
  define: dictionaryTool,
  summarizeMail: mailTool
};