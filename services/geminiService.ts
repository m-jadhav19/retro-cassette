
import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

// Lazy initialization of AI client to avoid errors if API key is not set
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI | null => {
  if (ai) return ai;
  
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.warn("Gemini API key not set. Some features may not work.");
    return null;
  }
  
  try {
    ai = new GoogleGenAI({ apiKey });
    return ai;
  } catch (error) {
    console.error("Failed to initialize Gemini AI:", error);
    return null;
  }
};

// Helper to convert HSL to Hex
const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Helper to generate consistent, aesthetically pleasing colors from a string
const stringToColor = (str: string, isLabel: boolean = false) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  if (isLabel) {
      // Curated list of paper/sticker tones for the label
      // Includes: Off-white, Cream, Pale Blue, Pale Pink, Pale Yellow, Mint
      const paperTones = [
          '#f8fafc', // Slate 50
          '#fffbeb', // Amber 50 (Cream)
          '#f0f9ff', // Sky 50
          '#fff1f2', // Rose 50
          '#f0fdf4', // Green 50
          '#fafafa', // Neutral 50
          '#fdf4ff', // Fuchsia 50
          '#ecfeff', // Cyan 50
      ];
      return paperTones[Math.abs(hash) % paperTones.length];
  }

  // Generate HSL for vibrant plastic body
  const h = Math.abs(hash) % 360;
  
  // Saturation: Keep high (60-90%) for that "plastic" look
  const s = 60 + (Math.abs(hash) % 31); 
  
  // Lightness: Keep mid-range (25-55%) 
  // This avoids colors being too black (lost on desk) or too white (looks like the label)
  const l = 25 + (Math.abs(hash) % 31); 

  return hslToHex(h, s, l);
};

// Fisher-Yates Shuffle to randomize array
const shuffleArray = <T>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

export const searchMusic = async (query: string): Promise<Song[]> => {
  try {
    let searchTerm = query;

    // 1. Optional: Use Gemini to interpret "vibe" if the query seems abstract
    if (query.split(' ').length > 3) {
        const aiClient = getAI();
        if (aiClient) {
            try {
                const response = await aiClient.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Convert this user vibe description into a simple 1-2 word search term for a music database (e.g. "rainy day" -> "acoustic", "gym" -> "workout"). Input: "${query}"`,
                });
                searchTerm = response.text?.trim() || query;
            } catch (e) {
                console.log("Gemini interpretation failed, using raw query");
            }
        }
    }

    // 2. Search iTunes API - Increased limit to get variety
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&limit=50`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        return [];
    }

    // 3. Filter out tracks without previews
    const validResults = data.results.filter((track: any) => track.previewUrl && track.trackName && track.artistName);

    // 4. Shuffle the valid results to simulate "random songs" from the query pool
    const shuffledResults = shuffleArray(validResults);

    // 5. Take the top 6 after shuffling
    const songs: Song[] = shuffledResults.slice(0, 6).map((track: any, index: number) => {
        // Mix genre and artist for unique body color
        const baseColor = stringToColor(track.primaryGenreName + track.artistName + "v2"); 
        // Use track name for label tint
        const accentColor = stringToColor(track.trackName, true); 

        return {
            id: `itunes-${track.trackId}-${Math.random().toString(36).substr(2, 5)}`, // Append random string to ID to ensure uniqueness on repeated searches
            title: track.trackName,
            artist: track.artistName,
            color: baseColor,
            accentColor: accentColor,
            duration: "0:30",
            audioUrl: track.previewUrl
        };
    });

    return songs;

  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};
