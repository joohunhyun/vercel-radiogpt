# RadioGPT - AI Podcast Generator

사용자 맞춤형 AI 팟캐스트 생성 및 실시간 피드백 반영 서비스

## 🚀 Features

- **Personalized Podcast Generation**: Create AI podcasts based on keywords or file uploads
- **Real-time Voice Interaction**: OpenAI Realtime API with WebRTC for live voice control
- **Fallback TTS System**: Automatic fallback to OpenAI TTS when Realtime API is unavailable
- **Interactive Controls**: Real-time feedback buttons and voice commands
- **Korean Language Support**: Full Korean interface and voice generation
- **Mobile-First Design**: Responsive UI optimized for mobile devices

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **AI Integration**: OpenAI GPT-4o Realtime API + TTS
- **Deployment**: Vercel (Edge Runtime)
- **Audio**: WebAudio API + HTML5 Audio

## 📋 Prerequisites

- Node.js 18+
- OpenAI API Key
- Modern browser with WebRTC support

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd cursor-radiogpt
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Deploy to Vercel

```bash
npm run build
vercel deploy
```

Make sure to set the `OPENAI_API_KEY` environment variable in your Vercel project settings.

## 📱 Pages & Routes

### `/login`

- Pseudo login/register page
- Korean interface with email input
- Non-functional SSO buttons (prototype)

### `/create`

- Podcast configuration page
- Keyword-based or file-based generation
- Tag input with removable chips
- Length slider (5min, 10min, 30min, 1hr, continuous)
- File upload support (.txt, .md files)

### `/player`

- Spotify-like player interface
- Real-time voice controls
- Interactive feedback buttons
- Active keyword management
- Progress tracking

## 🎛 API Routes

### `/api/session` (Edge Runtime)

- Creates ephemeral OpenAI Realtime API sessions
- Returns session credentials for WebRTC connection

### `/api/generate`

- Fallback text generation using GPT-4o-mini
- Used when Realtime API is unavailable

### `/api/tts`

- Text-to-speech conversion using OpenAI TTS
- Supports multiple voice options

## 🎵 Audio Systems

### Primary: OpenAI Realtime API

- WebRTC connection for real-time voice interaction
- Live audio streaming and processing
- Real-time control signal handling

### Fallback: OpenAI TTS

- Request/response based audio generation
- Automatic fallback when Realtime API fails
- Regenerates content based on control signals

## 🎮 Control System

### Real-time Feedback Buttons

- **더 깊게/더 쉽게**: Content depth adjustment
- **속도 ↑/↓**: Speaking speed control
- **톤: 부드럽게/에너지 있게**: Voice tone adjustment

### Voice Commands (Korean)

- "다음 주제" → Navigate to next topic
- "요약해줘" → Summarize current content
- "속도 빨리/느리게" → Speed adjustment
- "부드럽게/에너지 있게" → Tone adjustment

### Keyword Management

- Add/remove content keywords in real-time
- Live topic adaptation based on keyword changes

## 🎨 UI/UX Features

- **Mobile-First Design**: Optimized for 375-430px width
- **Clean Interface**: Rounded cards, big CTAs, modern spacing
- **Dark Accents**: Black CTAs with light gray chips
- **Responsive Layout**: Works on desktop and mobile
- **Loading States**: Proper loading indicators and error handling

## 📊 Data Model

```typescript
type PodcastConfig = {
  mode: "keywords" | "file";
  contentKeywords: string[];
  djKeywords: string[];
  length: 5 | 10 | 30 | 60 | "continuous";
  fileText?: string;
  language: "ko" | "en";
};
```

## 🔧 Known Limitations

1. **PDF Parsing**: PDF files show "Parsing not supported in prototype"
2. **No Persistent Database**: Uses localStorage for prototype state
3. **Limited Voice Commands**: Basic keyword matching for voice commands
4. **No User Authentication**: Pseudo login system for prototype
5. **Single Session**: No multi-user support

## 🚨 Error Handling

- **Mic Permission Denied**: Shows error banner with instructions
- **Session Token Failure**: Automatic fallback to TTS mode
- **Realtime Connection Failure**: Graceful degradation to fallback system
- **API Key Missing**: Clear error messages for configuration issues

## 🎯 Demo Values

### Default Content Keywords

- 음악, 영국, R&B, 심리, 심리·정신

### Default DJ Keywords

- 여성, 강연, 부드러운

### Default Length

- 10 minutes

### Voice Command Examples

- "오늘 경제 뉴스 알려줘" → Override topic to "오늘의 경제 뉴스"
- "다음 주제" → Navigate to next topic
- "요약해줘" → Summarize current content

## 🔮 Future Enhancements

- User authentication and database integration
- PDF file parsing support
- Advanced voice command recognition
- Multi-language support
- Podcast sharing and social features
- Analytics and usage tracking

## 📄 License

This is a prototype project for demonstration purposes.
