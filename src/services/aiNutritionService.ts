import { AI_CONFIG } from '../config/apiKeys';

export interface NutritionAnalysis {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving_info: string;
}

const BUILD_NUTRITION_PROMPT = (foodDescription: string, weight: number, unit: string) => `
You are a professional clinical nutritionist and dietary database API.
Analyze the following detailed meal/food description and portion:

Meal Description: "${foodDescription}"
Portion / Weight: ${weight}${unit}

Tasks:
1. Carefully parse all mentioned ingredients, preparations, cooking methods, and added oils/fats (e.g., "chicken fry with 10 ml oil" = chicken portion + 10ml added cooking oil; 10ml oil = ~88 kcal & ~10g fat).
2. Calculate the combined total calories, protein, carbohydrates, fat, and dietary fiber for the entire portion specified.
3. Formulate a clean, appetizing meal title (e.g., "Chicken Fry with 10ml Oil").

Return ONLY a valid JSON object in this exact format:
{
  "food_name": "<clean meal title>",
  "calories": <total number in kcal>,
  "protein": <total protein in grams>,
  "carbs": <total carbs in grams>,
  "fat": <total fat in grams>,
  "fiber": <total fiber in grams>,
  "serving_info": "<concise breakdown summary, e.g. '${weight}${unit} chicken + 10ml oil'>"
}

Rules:
- All nutritional values MUST be pure numbers (not strings), rounded to 1 decimal place.
- Do NOT include any markdown code blocks, intro, or explanation. Output ONLY the JSON object.
`;

function extractJSON(text: string): any {
  if (!text) return null;
  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch {}

  // Try to extract JSON from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // Try to find JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }

  return null;
}

async function callGroqAPI(foodDescription: string, weight: number, unit: string): Promise<NutritionAnalysis> {
  const prompt = BUILD_NUTRITION_PROMPT(foodDescription, weight, unit);

  const response = await fetch(AI_CONFIG.groq.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.groq.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.groq.model,
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition database API. You ONLY return valid JSON without markdown.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 1500, // reasoning models like openai/gpt-oss-120b require sufficient token headroom
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn('Groq API error:', response.status, errorText);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in Groq response');
  }

  const parsed = extractJSON(content);
  if (!parsed || typeof parsed.calories !== 'number') {
    throw new Error('Invalid JSON structure from Groq');
  }

  return {
    food_name: parsed.food_name || foodDescription,
    calories: Math.round(parsed.calories * 10) / 10,
    protein: Math.round(parsed.protein * 10) / 10,
    carbs: Math.round(parsed.carbs * 10) / 10,
    fat: Math.round(parsed.fat * 10) / 10,
    fiber: Math.round((parsed.fiber || 0) * 10) / 10,
    serving_info: parsed.serving_info || `${weight}${unit}`,
  };
}

async function callGeminiAPI(foodDescription: string, weight: number, unit: string): Promise<NutritionAnalysis> {
  const prompt = BUILD_NUTRITION_PROMPT(foodDescription, weight, unit);
  const url = `${AI_CONFIG.gemini.baseUrl}/${AI_CONFIG.gemini.model}:generateContent?key=${AI_CONFIG.gemini.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('No content in Gemini response');
  }

  const parsed = extractJSON(content);
  if (!parsed || typeof parsed.calories !== 'number') {
    throw new Error('Invalid JSON structure from Gemini');
  }

  return {
    food_name: parsed.food_name || foodDescription,
    calories: Math.round(parsed.calories * 10) / 10,
    protein: Math.round(parsed.protein * 10) / 10,
    carbs: Math.round(parsed.carbs * 10) / 10,
    fat: Math.round(parsed.fat * 10) / 10,
    fiber: Math.round((parsed.fiber || 0) * 10) / 10,
    serving_info: parsed.serving_info || `${weight}${unit}`,
  };
}

/**
 * Analyze food nutrition from a natural description with separate weight/portion.
 * Tries Groq first (high speed), falls back to Gemini if needed.
 */
export async function analyzeFood(
  foodDescription: string,
  weight: number = 100,
  unit: string = 'g'
): Promise<NutritionAnalysis> {
  if (!foodDescription.trim()) {
    throw new Error('Food description is required');
  }

  const safeWeight = Math.max(1, weight || 100);
  const safeUnit = unit || 'g';

  // Try Groq first (high-speed LPU)
  try {
    const result = await callGroqAPI(foodDescription.trim(), safeWeight, safeUnit);
    console.log('✅ Groq AI nutrition analysis:', result);
    return result;
  } catch (groqError) {
    console.warn('⚠️ Groq failed, trying Gemini fallback:', groqError);
  }

  // Fallback to Gemini
  try {
    const result = await callGeminiAPI(foodDescription.trim(), safeWeight, safeUnit);
    console.log('✅ Gemini AI nutrition analysis:', result);
    return result;
  } catch (geminiError) {
    console.error('❌ Both AI APIs failed:', geminiError);
    throw new Error('Unable to analyze meal description. Please verify values manually.');
  }
}
