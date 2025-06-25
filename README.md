# Task Automation Assistant

An intelligent AI-powered chat application that can automate various tasks through specialized tools. Built with Next.js and powered by Groq's Gemma2-9B model, this assistant can help users with calculations, weather information, file analysis, and more through natural conversation.

## 🤖 About the Project

The Task Automation Assistant is a conversational AI that intelligently determines when to use specific tools to help users accomplish tasks. Instead of just providing text responses, the assistant can:

- **Analyze user requests** to determine if specialized tools are needed
- **Execute appropriate tools** automatically based on the conversation context
- **Provide real-time streaming responses** for a smooth user experience
- **Handle file uploads** and analyze various file formats

### AI Agents and Tools

The system uses a sophisticated two-step AI process:

1. **Tool Analysis Agent**: Analyzes incoming messages to determine if any tools are needed and which ones to use
2. **Response Generation Agent**: Generates natural language responses incorporating tool results

#### Available Tools

🌤️ **Weather Tool**
- Get current weather information for any location worldwide
- Provides temperature, humidity, wind speed, and weather conditions
- Uses OpenWeatherMap API for accurate, real-time data

🧮 **Calculator Tool**
- Perform mathematical calculations and arithmetic operations
- Supports basic operations (+, -, *, /, %, parentheses)
- Safe expression evaluation with input validation

📄 **File Reader Tool**
- Analyze uploaded files including JSON, CSV, text, and markdown
- Automatic file type detection and parsing
- Provides structure analysis, summaries, and content previews
- Supports various analysis modes (analyze, summarize, extract)

## 🛠️ Technologies Used

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Icon library

### Backend & AI
- **Groq SDK** - AI inference with Gemma2-9B model
- **Next.js API Routes** - Serverless API endpoints
- **Edge Runtime** - Fast, lightweight execution environment
- **Server-Sent Events** - Real-time streaming responses

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Bun** - Fast package manager and runtime

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ or Bun
- A Groq API key (free at [console.groq.com](https://console.groq.com))
- OpenWeatherMap API key (optional, for weather functionality)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-automation-assistant
   ```

2. **Install dependencies**
   ```bash
   # Using bun (recommended)
   bun install
   
   # Or using npm
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Required: Groq API key for AI functionality
   GROQ_API_KEY=your_groq_api_key_here
   
   # Optional: OpenWeatherMap API key for weather tool
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```

4. **Start the development server**
   ```bash
   # Using bun
   bun dev
   
   # Or using npm
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to start using the assistant.

### Getting API Keys

**Groq API Key (Required)**
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key

**OpenWeatherMap API Key (Optional)**
1. Visit [openweathermap.org](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key from your dashboard

## 📝 Usage

1. **Start a conversation** - Type any message to begin
2. **Upload files** - Drag and drop or click to upload files for analysis
3. **Ask for calculations** - Request math operations naturally
4. **Check weather** - Ask about weather in any location
5. **Get help** - The AI will automatically determine which tools to use

### Example Interactions

- "What's the weather like in Tokyo?"
- "Calculate 15% tip on a $45.67 bill"
- "Analyze this CSV file" (with file upload)
- "What's 2^10 + 5 * 3?"

## 🏗️ Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/chat/       # Chat API endpoint
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main chat interface
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── chat-bubble.tsx
│   ├── chat-input.tsx
│   └── welcome-screen.tsx
├── lib/               # Core library code
│   ├── ai/           # AI service and prompts
│   ├── tools/        # Tool definitions and registry
│   └── utils.ts      # Utility functions
└── types/            # TypeScript type definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
