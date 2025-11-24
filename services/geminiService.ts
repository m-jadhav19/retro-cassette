
import { GoogleGenAI } from "@google/genai";
import { Song } from "../types";

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
    // Only initialize AI here to prevent top-level crashes if process.env is undefined
    if (query.split(' ').length > 3) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Convert this user vibe description into a simple 1-2 word search term for a music database (e.g. "rainy day" -> "acoustic", "gym" -> "workout"). Input: "${query}"`,
            });
            searchTerm = response.text?.trim() || query;
        } catch (e) {
            console.log("Gemini interpretation failed, using raw query");
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

    // 4. Helper to clean and format titles
    const cleanTitle = (title: string): string => {
        if (!title) return title;
        
        // Remove common generic phrases that appear in many tracks
        const genericPhrases = [
            'Jazz Classics',
            'Background for',
            'Music for',
            'Ambiance for',
            'Mood for',
            'Vibe for',
            'Soundtrack for',
            'Backdrops for',
            'Ambience for',
            'Moods for',
            'Music for Cooking',
            'Background Music',
            'Chilled Music',
            'Relaxed Music',
            'Lively Music',
            'Sophisticated',
            'Charming',
            'Delightful',
            'Sensational',
            'Bright',
            'Sprightly',
            'Pulsating',
            'Inspiring',
            'Happy',
            'Simplistic',
            'Sultry',
            'Stylish',
            'No Drums Jazz',
            'for Lockdowns',
            'for Quarantine',
            'for Work from Home',
            'for Preparing Dinner',
            'for Cooking Dinner',
            'for Cooking',
            ' - '
        ];
        
        let cleaned = title.trim();
        
        // Remove generic phrases (case-insensitive)
        genericPhrases.forEach(phrase => {
            const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            cleaned = cleaned.replace(regex, '').trim();
        });
        
        // If title becomes too short or empty after cleaning, use original but clean it up
        if (cleaned.length < 3) {
            cleaned = title.trim();
        }
        
        // Remove extra whitespace and clean up
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        // Capitalize first letter of each word (title case)
        cleaned = cleaned.split(' ').map(word => {
            if (word.length === 0) return word;
            return word[0].toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
        
        // Handle special cases (keep certain words lowercase)
        const lowercaseWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        cleaned = cleaned.split(' ').map((word, index) => {
            if (index > 0 && lowercaseWords.includes(word.toLowerCase())) {
                return word.toLowerCase();
            }
            return word;
        }).join(' ');
        
        return cleaned || title; // Fallback to original if cleaning results in empty
    };

    // 5. Remove duplicate titles (case-insensitive) and clean them
    const seenTitles = new Set<string>();
    const uniqueResults: any[] = [];
    
    for (const track of validResults) {
        const cleanedTitle = cleanTitle(track.trackName).toLowerCase();
        if (!seenTitles.has(cleanedTitle)) {
            seenTitles.add(cleanedTitle);
            uniqueResults.push(track);
        }
    }

    // 6. Shuffle the unique results to simulate "random songs" from the query pool
    const shuffledResults = shuffleArray(uniqueResults);

    // 7. Take the top 6 after shuffling and clean titles
    const songs: Song[] = shuffledResults.slice(0, 6).map((track: any, index: number) => {
        // Mix genre and artist for unique body color
        const baseColor = stringToColor(track.primaryGenreName + track.artistName + "v2"); 
        // Use track name for label tint
        const accentColor = stringToColor(track.trackName, true); 
        
        const cleanedTitle = cleanTitle(track.trackName);
        const cleanedArtist = track.artistName.trim();

        return {
            id: `itunes-${track.trackId}-${Math.random().toString(36).substr(2, 5)}`, // Append random string to ID to ensure uniqueness on repeated searches
            title: cleanedTitle,
            artist: cleanedArtist,
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
