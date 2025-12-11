
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure API_KEY is set in your environment variables for local development
// In production, this would be handled by the hosting environment.
const API_KEY = process.env.API_KEY || ''; 

if (!API_KEY) {
  console.warn("API_KEY is not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates a job description using the Gemini API based on provided keywords.
 * @param keywords Keywords for the job description.
 * @returns A promise that resolves to the generated job description string.
 */
export const generateJobDescription = async (keywords: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  try {
    const prompt = `Generate a detailed and professional job description for a position based on these keywords: "${keywords}". Include responsibilities, qualifications, and a brief company overview. Keep it concise, around 200 words.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using a pro model for better quality text generation
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 250, // Limit output to roughly 250 tokens
        systemInstruction: "You are a professional HR assistant specializing in writing clear and engaging job descriptions.",
      },
    });

    const text = response.text;
    if (text) {
      return text;
    } else {
      console.error("Gemini API returned an empty response text.");
      return "Failed to generate job description. Please try again or write it manually.";
    }
  } catch (error) {
    console.error("Error generating job description with Gemini API:", error);
    if (error instanceof Error) {
        return `Error: ${error.message}. Please check your API key and network connection.`;
    }
    return "An unexpected error occurred while generating the job description.";
  }
};
