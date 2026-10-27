// AI API Configuration
// Read from environment variables (prefixed with EXPO_PUBLIC_ for Expo / Web)
// In Render or local .env, define:
// EXPO_PUBLIC_GROQ_API_KEY
// EXPO_PUBLIC_GEMINI_API_KEY

export const AI_CONFIG = {
  groq: {
    apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
    model: 'openai/gpt-oss-120b',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
  },
  gemini: {
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
    model: 'gemini-flash-latest',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
};
