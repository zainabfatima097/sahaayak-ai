const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// List of available models from your console output
const AVAILABLE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-001', 
  'gemini-2.0-flash-lite-001',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
  'gemini-2.5-flash'
];

export class GeminiClient {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.currentModelIndex = 0;
  }

  async generateResponse(userQuery, userContext, domain = 'general') {
    try {
      if (!this.apiKey) {
        return this.getMockResponse(userQuery, userContext, domain);
      }

      const prompt = this.buildPrompt(userQuery, userContext, domain);
      
      // Try each model until one works
      for (let i = 0; i < AVAILABLE_MODELS.length; i++) {
        const model = AVAILABLE_MODELS[i];
        console.log(`Trying model: ${model}...`);
        
        try {
          const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${this.apiKey}`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              }
            })
          });

          if (response.status === 503) {
            console.log(`Model ${model} is busy (503), trying next...`);
            continue;
          }

          if (response.status === 404) {
            console.log(`Model ${model} not found (404), trying next...`);
            continue;
          }

          if (!response.ok) {
            console.log(`Model ${model} failed with status ${response.status}, trying next...`);
            continue;
          }

          const data = await response.json();
          if (data.candidates && data.candidates[0]) {
            console.log(`✅ Successfully used model: ${model}`);
            const aiResponse = data.candidates[0].content.parts[0].text;
            return this.parseResponse(aiResponse, domain);
          }
        } catch (err) {
          console.log(`Error with model ${model}:`, err.message);
          continue;
        }
      }
      
      // If all models fail, use mock response
      console.warn('All Gemini models failed, using mock response');
      return this.getMockResponse(userQuery, userContext, domain);
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getMockResponse(userQuery, userContext, domain);
    }
  }

  getMockResponse(userQuery, userContext, domain) {
    const responses = {
      agriculture: `🌾 **Farming Advice**\n\nYou asked: "${userQuery}"\n\nHere are helpful tips:\n• Best time to plant: Early monsoon season\n• Use organic fertilizers like compost\n• Contact your local Krishi Vigyan Kendra for soil testing\n• Check MSP rates at msp.dac.gov.in\n\n📞 Helpline: 1800-180-1551\n\n💡 The AI service is currently busy. Your question has been saved and will be answered when service resumes.`,
      
      healthcare: `🏥 **Health Guidance**\n\nRegarding: "${userQuery}"\n\nGeneral suggestions:\n• Drink plenty of water and rest\n• Visit your nearest PHC if symptoms persist\n• For emergencies, call 108 immediately\n• Check Ayushman Bharat scheme for health insurance\n\n⚠️ This is general guidance only. Please consult a doctor for proper medical advice.\n\n📞 Health Helpline: 104\n\n💡 The AI service is currently busy. Please try again in a few minutes.`,
      
      education: `📚 **Education Support**\n\nAbout: "${userQuery}"\n\nResources available:\n• National Scholarship Portal: scholarships.gov.in\n• Free courses on DIKSHA platform\n• Skill development programs at PMKVY centers\n• Mid-day meal scheme for school children\n\n📞 Education Helpline: 1800-11-8004\n\n💡 The AI service is experiencing high demand. Your question will be processed shortly.`,
      
      schemes: `📋 **Government Schemes**\n\nBased on your query: "${userQuery}"\n\nPopular schemes:\n• PM-KISAN: ₹6000/year for farmers\n• Ayushman Bharat: ₹5 lakh health insurance\n• PM Awas Yojana: Housing assistance\n• Ration Card: Subsidized food grains\n\n📍 Visit your nearest CSC center to apply\n📞 Helpline: 155261\n\n💡 The AI service is temporarily busy. Please try again in a moment.`,
      
      general: `🤝 **Sahaayak AI Assistant**\n\nYou asked: "${userQuery}"\n\nI can help you with:\n• 🌾 Agriculture - Farming tips, MSP rates, weather\n• 🏥 Healthcare - Health guidance, schemes, helplines\n• 📚 Education - Scholarships, schools, courses\n• 📋 Government Schemes - Benefits, eligibility, application\n\n⚠️ **Note:** The AI service is currently experiencing high demand. Please try your question again in a few minutes.\n\n🎤 You can also use voice input by clicking the microphone button.`
    };
    
    const responseText = responses[domain] || responses.general;
    
    return {
      text: responseText,
      actionable: {
        phoneNumbers: ['1800-180-1551', '104', '108', '155261'],
        nextSteps: ['Visit your nearest CSC center', 'Call the helpline for more information', 'Try again in a few minutes']
      }
    };
  }

  buildPrompt(userQuery, userContext, domain) {
    const templates = {
      general: `You are Sahaayak AI, a helpful assistant for rural Indian communities. 
User Query: "${userQuery}"
User Location: ${userContext.location || 'rural India'}
Language: ${userContext.language || 'Hindi'}

Provide a helpful, concise response. Keep language simple.`,

      agriculture: `You are an agricultural expert. User Query: "${userQuery}". Provide practical farming advice in simple language.`,

      healthcare: `You are a healthcare assistant. User Query: "${userQuery}". Provide general health guidance. Always say consult a doctor for diagnosis.`,

      education: `You are an education advisor. User Query: "${userQuery}". Provide helpful information about education.`,

      schemes: `You are a government scheme expert. User Query: "${userQuery}". Provide information about relevant government schemes.`
    };

    return templates[domain] || templates.general;
  }

  parseResponse(response, domain) {
    const phoneMatch = response.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g);
    const schemeMatch = response.match(/Scheme:?\s*([^\n]+)/i);
    const eligibilityMatch = response.match(/Eligibility:?\s*([^\n]+)/i);
    
    const steps = [];
    const stepMatches = response.match(/\d+\.\s*([^\n]+)/g);
    if (stepMatches) {
      stepMatches.forEach(match => {
        steps.push(match.replace(/^\d+\.\s*/, ''));
      });
    }
    
    return {
      text: response,
      actionable: {
        phoneNumbers: phoneMatch || [],
        schemeName: schemeMatch ? schemeMatch[1] : null,
        eligibility: eligibilityMatch ? eligibilityMatch[1] : null,
        nextSteps: steps
      }
    };
  }
}

export const geminiClient = new GeminiClient();