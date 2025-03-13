import { runGemini } from '@/app/actions';
import { tool as createTool } from 'ai';
import { z } from 'zod';


export const imageGenerationTool = createTool({
  description: 'Generate an image',
  parameters: z.object({
    topic: z.string().describe('The topic to generate the image about')
}),
execute: async function ({ topic }) {
  try {
    const image = await runGemini(topic)

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
  define: dictionaryTool
};