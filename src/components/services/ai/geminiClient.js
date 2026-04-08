import { promptTemplates } from './promptTemplates';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export class GeminiClient {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
  }

  async generateResponse(userQuery, userContext, domain = 'general') {
    try {
      const prompt = this.buildPrompt(userQuery, userContext, domain);
      
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      // Parse response into structured format
      return this.parseResponse(aiResponse, domain);
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        text: "माफ करें, अभी सेवा उपलब्ध नहीं है। कृपया थोड़ी देर बाद प्रयास करें। (Sorry, service is unavailable. Please try again later.)",
        actionable: null,
        error: true
      };
    }
  }

  buildPrompt(userQuery, userContext, domain) {
    const template = promptTemplates[domain] || promptTemplates.general;
    
    return template
      .replace('{{query}}', userQuery)
      .replace('{{location}}', userContext.location || 'unknown')
      .replace('{{occupation}}', userContext.occupation || 'unknown')
      .replace('{{income_level}}', userContext.income_level || 'unknown')
      .replace('{{language}}', userContext.language || 'Hindi');
  }

  parseResponse(response, domain) {
    // Extract actionable items using regex patterns
    const phoneMatch = response.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g);
    const schemeMatch = response.match(/Scheme:?\s*([^\n]+)/i);
    const eligibilityMatch = response.match(/Eligibility:?\s*([^\n]+)/i);
    
    return {
      text: response,
      actionable: {
        phoneNumbers: phoneMatch || [],
        schemeName: schemeMatch ? schemeMatch[1] : null,
        eligibility: eligibilityMatch ? eligibilityMatch[1] : null,
        nextSteps: this.extractSteps(response)
      }
    };
  }

  extractSteps(response) {
    const steps = [];
    const stepMatches = response.match(/\d+\.\s*([^\n]+)/g);
    if (stepMatches) {
      stepMatches.forEach(match => {
        steps.push(match.replace(/^\d+\.\s*/, ''));
      });
    }
    return steps;
  }
}

export const geminiClient = new GeminiClient();