<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎵 Retro Cassette - AI-Powered Music Discovery

A nostalgic, interactive music discovery experience that brings back the magic of 2000s mixtapes. Search for music vibes using AI, generate unique cassette tapes, and drag them into your Walkman to play. Complete with retro desk decorations, authentic sound effects, and a beautifully crafted UI that captures the essence of the early 2000s.

## ✨ Features

- **AI-Powered Music Discovery**: Use Google Gemini AI to search for music based on vibes, moods, or genres
- **Interactive Walkman**: Drag and drop cassettes into your Walkman to play them
- **Retro Aesthetic**: Immersive 2000s-themed desktop environment with authentic decorations
- **Drag & Drop Interface**: Intuitive cassette tape management with smooth animations
- **Surprise Me**: Discover random music genres and styles with one click
- **Sound Effects**: Authentic audio feedback for interactions (grab, drop, insert, click)

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/retro-cassette.git
   cd retro-cassette
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 🛠️ Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

## 🎨 Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Google Gemini AI** - Music discovery and recommendations
- **Tailwind CSS** - Styling (via inline classes)

## 📖 How to Use

1. **Search for Music**: Type a vibe, mood, or genre in the notebook (e.g., "synthwave", "lofi hiphop", "90s rock")
2. **Generate Cassettes**: Click "CREATE!" to generate a mixtape of songs matching your query
3. **Drag & Drop**: Drag cassettes around the desk or drop them into the Walkman to play
4. **Surprise Me**: Click "✨ Random?" to discover random music genres
5. **Eject**: Click the eject button on the Walkman to return the current cassette to your collection

## 🎯 Project Structure

```
retro-cassette/
├── components/
│   ├── Cassette.tsx      # Cassette tape component
│   └── Walkman.tsx       # Walkman player component
├── services/
│   └── geminiService.ts  # Gemini AI integration
├── App.tsx               # Main application component
├── constants.ts          # Default songs and sound effects
├── types.ts              # TypeScript type definitions
└── vite.config.ts        # Vite configuration
```

## 🌐 View in AI Studio

[View your app in AI Studio](https://ai.studio/apps/drive/1VWCyh7tQLpoe4Zum5WfYMKAVhr0GbSNh)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

Made with ❤️ and nostalgia for the 2000s
