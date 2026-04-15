<div align="center">

# Sahaayak AI

### Voice-First AI Assistant for Rural India

*Bridging the digital divide, one voice at a time*

[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange?style=flat&logo=firebase)](https://sahaayak-ai-84c2c.web.app)
[![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)](https://reactjs.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-purple?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**[Live Demo](https://sahaayak-ai-84c2c.web.app) · [Report Bug](https://github.com/zainabfatima097/sahaayak-ai/issues)**

</div>

---

## About

Sahaayak AI is a **voice-first progressive web app** designed for rural communities across India. Farmers, students, and families can speak naturally in their native language to access expert guidance on agriculture, healthcare, education, and government schemes,  no typing, no reading required.

> **Goal:** Make AI accessible to the 65%+ of India that lives in rural areas, many of whom face literacy or connectivity barriers.

---

## Features

| Category | Capability |
|---|---|
| **Voice First** | Speak naturally in 6 Indian languages |
| **AI Assistant** | Gemini-powered responses across 4 domains |
| **Agriculture** | Weather, MSP rates, crop & farming tips |
| **Healthcare** | Health guidance & Ayushman Bharat info |
| **Education** | Scholarships, courses, and learning resources |
| **Govt. Schemes** | PM-KISAN, Ration Card, Housing, and more |
| **Success Stories** | Community-driven stories & shared experiences |
| **Dark Mode** | Full light/dark theme support |
| **Offline Ready** | Core functionality without internet |
| **Secure Auth** | Google Sign-in and guest mode |

---

## Tech Stack

**Frontend**
```
React 18  ·  Vite  ·  Tailwind CSS  ·  Lucide Icons  ·  Web Speech API
```

**Backend**
```
Firebase Auth  ·  Firestore  ·  Firebase Hosting  ·  Firebase Storage
```

**AI**
```
Google Gemini API  (gemini-2.5-flash  +  fallback models)
```

---

## Project Structure

```
sahaayak-ai/
├── public/                     # PWA assets & icons
├── src/
│   ├── components/
│   │   ├── chat/               # ChatInterface, ChatHistory
│   │   ├── layout/             # ChatLayout, Header, BottomNav
│   │   ├── common/             # VoiceButton, ThemeToggle
│   │   └── stories/            # StoryCard, PostStoryModal
│   ├── pages/                  # Home, Login, Profile, Stories
│   ├── context/                # UserContext, ThemeContext
│   ├── hooks/                  # useStories, useScrollReveal
│   ├── services/               # Firebase, Gemini API
│   └── styles/                 # Global CSS with dark mode
└── dist/                       # Production build output
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 
- Firebase project
- Gemini API key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/zainabfatima097/sahaayak-ai.git
cd sahaayak-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env

# 4. Start the development server
npm run dev

# 5. Build for production
npm run build

# 6. Deploy to Firebase
firebase deploy --only hosting
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_APP_ID=your_app_id

# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_key
```

---

## Usage

1. **Login** : Sign in with Google or continue as a guest
2. **Speak** : Tap the mic and ask your question in Hindi, English, or any supported language
3. **Explore** : Browse Agriculture, Healthcare, Education, or Government Schemes
4. **Share** : Post your success story to help others in your community
5. **Profile** : Track your activity and manage preferences

### Example Voice Commands

```
# Agriculture
"धान की खेती कैसे करें?"
"What is the MSP for wheat this season?"

# Healthcare
"बुखार का घरेलू इलाज बताओ"
"Nearest hospital in my village"

# Education
"Scholarships for 10th pass students"
"मुफ्त ऑनलाइन कोर्स कहाँ मिलेंगे?"

# Government Schemes
"PM-KISAN scheme ke liye kaise apply karein?"
"राशन कार्ड कैसे बनवाएं"
```

---

## Supported Languages

| Language | Code | Voice Support |
|---|---|:---:|
| हिन्दी (Hindi) | `hi-IN` | ✅ |
| English | `en-IN` | ✅ |
| తెలుగు (Telugu) | `te-IN` | ✅ |
| मराठी (Marathi) | `mr-IN` | ✅ |
| தமிழ் (Tamil) | `ta-IN` | ✅ |
| বাংলা (Bengali) | `bn-IN` | ✅ |

---

## 📊 Project Status

| Feature | Status | 
|---|:---:|
| AI Chat (4 domains) | ████████████░ 95% |
| Voice I/O | █████████████ 100% |
| Multi-language support | █████████████ 100% |
| Chat History | ████████████░ 95% |
| Success Stories | ███████████░░ 85% |
| Dark Mode | █████████████ 100% |
| Offline Support | ███████████░░ 85% |
| User Profiles | ████████████░ 95% |

**Overall Completion: 92%**

---

## Roadmap

- [ ] Real-time weather API integration
- [ ] Push notifications for scheme updates
- [ ] Full offline-first mode with background sync
- [ ] Crop disease detection via image upload
- [ ] Voice-only mode for users with low literacy
- [ ] Admin dashboard for content moderation

---

## Known Issues

- **Gemini API rate limits** (429 errors) : fallback models are implemented
- **Voice recognition** works best on Chrome and Edge browsers

---

## Acknowledgements

- [Google Gemini AI](https://deepmind.google/technologies/gemini/) : Language model powering the assistant
- [Firebase](https://firebase.google.com/) : Backend infrastructure
- [Lucide](https://lucide.dev/) : Icon library

---

<div align="center">

Made with ❤️ for Rural India 🇮🇳

</div>
