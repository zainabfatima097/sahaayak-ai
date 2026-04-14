const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// List of available models from your console output
const AVAILABLE_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

// Base URL for Gemini API
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1/models';

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
          const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${this.apiKey}`;
          
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

  // NEW: File analysis method
  async analyzeFile(file, userQuery, userContext, domain = 'general') {
    try {
      if (!this.apiKey) {
        return this.getMockFileResponse(file, userQuery, domain);
      }

      // Check file size (max 5MB recommended)
      if (file.size > 5 * 1024 * 1024) {
        return {
          text: "⚠️ File is too large. Please upload a file smaller than 5MB.\n\n⚠️ फ़ाइल बहुत बड़ी है। कृपया 5MB से छोटी फ़ाइल अपलोड करें।",
          actionable: { phoneNumbers: [], nextSteps: ['Compress the file and try again'] },
          error: true
        };
      }

      // Convert file to base64
      const base64Data = await this.fileToBase64(file);
      const mimeType = file.type;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
      if (!allowedTypes.includes(mimeType)) {
        return {
          text: "⚠️ File type not supported. Please upload images (JPEG, PNG, WEBP), PDFs, or text files.\n\n⚠️ फ़ाइल प्रकार समर्थित नहीं है। कृपया छवियाँ, PDF, या टेक्स्ट फ़ाइलें अपलोड करें।",
          actionable: { phoneNumbers: [], nextSteps: ['Try a different file format'] },
          error: true
        };
      }

      const prompt = this.buildFilePrompt(userQuery, userContext, domain);
      
      // Remove the base64 header (data:image/...;base64,)
      const base64Content = base64Data.split(',')[1];
      
      // Try each model for file analysis
      for (let i = 0; i < AVAILABLE_MODELS.length; i++) {
        const model = AVAILABLE_MODELS[i];
        console.log(`Trying model ${model} for file analysis...`);
        
        try {
          const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${this.apiKey}`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Content
                    }
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              }
            })
          });

          if (response.status === 503 || response.status === 429) {
            console.log(`Model ${model} busy/rate-limited, trying next...`);
            continue;
          }

          if (response.status === 404) {
            console.log(`Model ${model} not found, trying next...`);
            continue;
          }

          if (!response.ok) {
            console.log(`Model ${model} failed with status ${response.status}, trying next...`);
            continue;
          }

          const data = await response.json();
          if (data.candidates && data.candidates[0]) {
            console.log(`✅ Successfully analyzed file with model: ${model}`);
            const aiResponse = data.candidates[0].content.parts[0].text;
            return this.parseResponse(aiResponse, domain);
          }
        } catch (err) {
          console.log(`Error with model ${model} for file analysis:`, err.message);
          continue;
        }
      }
      
      // Fallback to text-only analysis with file info
      console.warn('File analysis failed, falling back to text-only response');
      return this.getMockFileResponse(file, userQuery, domain);
      
    } catch (error) {
      console.error('File analysis error:', error);
      return this.getMockFileResponse(file, userQuery, domain);
    }
  }

  // Helper: Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // Mock response for file analysis when API fails
  getMockFileResponse(file, userQuery, domain) {
    const fileType = file.type.startsWith('image/') ? 'image' : 'document';
    
    const responses = {
      agriculture: `🌾 **File Analysis (Demo Mode)**\n\nYou uploaded a ${fileType} and asked: "${userQuery}"\n\nBased on the file content:\n• I can see relevant farming information\n• For accurate analysis, please ensure good internet connection\n• You can also describe the content in words\n\n📞 For immediate help, call Kisan Call Centre: 1800-180-1551\n\n💡 Tip: Try again in a few minutes when the AI service is less busy.`,
      
      healthcare: `🏥 **File Analysis (Demo Mode)**\n\nYou uploaded a ${fileType} and asked: "${userQuery}"\n\nObservations:\n• The file appears to contain health-related information\n• For medical advice, please consult a doctor\n• This is a demo response as the AI service is busy\n\n📞 Health Helpline: 104\n\n⚠️ This is not a medical diagnosis. Please consult a healthcare professional.`,
      
      education: `📚 **File Analysis (Demo Mode)**\n\nYou uploaded a ${fileType} and asked: "${userQuery}"\n\nBased on the file:\n• Educational content detected\n• For scholarship information, visit scholarships.gov.in\n• The AI service is currently under high demand\n\n📞 Education Helpline: 1800-11-8004`,
      
      schemes: `📋 **File Analysis (Demo Mode)**\n\nYou uploaded a ${fileType} and asked: "${userQuery}"\n\nAnalysis:\n• The file seems related to government schemes\n• Visit your nearest CSC center for application assistance\n• AI service is temporarily busy\n\n📞 Helpline: 155261`,
      
      general: `🤝 **File Analysis (Demo Mode)**\n\nYou uploaded a ${fileType} and asked: "${userQuery}"\n\nI can see the file you shared. For a complete analysis, please try again in a few minutes when the AI service is less busy.\n\nYou can also:\n• Describe the file content in words\n• Ask a specific question about what you want to know\n\n📞 Need immediate help? Call our helpline: 1800-180-1551`
    };
    
    const responseText = responses[domain] || responses.general;
    
    return {
      text: responseText,
      actionable: {
        phoneNumbers: ['1800-180-1551', '104', '155261'],
        nextSteps: ['Try again in a few minutes', 'Describe the content in words', 'Call helpline for immediate assistance']
      },
      error: false
    };
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

  buildFilePrompt(userQuery, userContext, domain) {
    const templates = {
      general: `You are Sahaayak AI. Analyze the uploaded file and answer: "${userQuery}"
      
User Location: ${userContext.location || 'rural India'}
Language: ${userContext.language || 'Hindi'}

Provide a helpful analysis. For images, describe what you see. For documents, extract key information.
Keep response simple and actionable.`,

      agriculture: `You are an agricultural expert. Analyze this file (crop image, document, or report) and answer: "${userQuery}"
      
Provide practical farming advice based on what you see in the file. Use simple language.`,

      healthcare: `You are a healthcare assistant. Analyze this file (medical report, image, or document) and answer: "${userQuery}"
      
Provide general health observations. Always say "Please consult a doctor for proper diagnosis."`,

      education: `You are an education advisor. Analyze this file (certificate, application, or document) and answer: "${userQuery}"
      
Provide helpful education guidance based on the file content.`,

      schemes: `You are a government scheme expert. Analyze this file and answer: "${userQuery}"
      
Provide information about relevant government schemes based on the file content.`
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