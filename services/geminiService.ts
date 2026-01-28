
import { GoogleGenAI } from "@google/genai";
import { Song } from "../types";
import { processMusicData, removeDuplicates, ITunesTrack } from "./musicMiddleware";

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

// Pre-defined palette of vibrant cassette body colors with good contrast
const CASSETTE_COLORS = [
  '#e63946', // Red
  '#f77f00', // Orange
  '#fcbf49', // Yellow
  '#06a77d', // Teal
  '#118ab2', // Blue
  '#7209b7', // Purple
  '#b5179e', // Pink
  '#560bad', // Deep Purple
  '#3a0ca3', // Indigo
  '#4361ee', // Bright Blue
  '#4cc9f0', // Sky Blue
  '#06ffa5', // Mint
  '#06d6a0', // Green
  '#06ffa5', // Aqua
  '#ffbe0b', // Amber
  '#fb5607', // Red Orange
  '#ff006e', // Hot Pink
  '#8338ec', // Violet
  '#3a86ff', // Azure
  '#06ffa5', // Emerald
  '#ffd60a', // Gold
  '#ff006e', // Magenta
  '#8338ec', // Purple
  '#3a86ff', // Blue
];

// Pre-defined palette of vinyl record colors (darker, more muted for vinyl aesthetic)
const VINYL_COLORS = [
  '#1a1a2e', // Deep Navy
  '#16213e', // Dark Blue
  '#0f3460', // Midnight Blue
  '#533483', // Deep Purple
  '#4a148c', // Dark Purple
  '#6a1b9a', // Purple
  '#880e4f', // Deep Pink
  '#b71c1c', // Dark Red
  '#c62828', // Red
  '#d84315', // Deep Orange
  '#e65100', // Orange
  '#33691e', // Dark Green
  '#1b5e20', // Forest Green
  '#004d40', // Dark Teal
  '#006064', // Teal
  '#01579b', // Dark Blue
];

// Helper to calculate relative luminance for contrast checking
const getLuminance = (hex: string): number => {
  const rgb = hex.match(/[A-Za-z0-9]{2}/g)?.map(v => parseInt(v, 16)) || [0, 0, 0];
  const [r, g, b] = rgb.map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Helper to calculate contrast ratio between two colors
const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

// Helper to generate consistent, aesthetically pleasing colors from a string
const stringToColor = (str: string, isLabel: boolean = false, isVinyl: boolean = false) => {
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

  // Use pre-defined palette for vinyl records
  if (isVinyl) {
    return VINYL_COLORS[Math.abs(hash) % VINYL_COLORS.length];
  }

  // Use pre-defined palette for cassette bodies, ensuring good contrast
  const baseColor = CASSETTE_COLORS[Math.abs(hash) % CASSETTE_COLORS.length];
  
  // Ensure minimum contrast with common backgrounds (dark backgrounds)
  // Target: at least 3:1 contrast ratio for readability
  const darkBackground = '#1a1a1a'; // Typical dark background
  let contrast = getContrastRatio(baseColor, darkBackground);
  
  // If contrast is too low, adjust lightness
  if (contrast < 2.5) {
    // Convert to HSL, adjust lightness, convert back
    const rgb = baseColor.match(/[A-Za-z0-9]{2}/g)?.map(v => parseInt(v, 16)) || [0, 0, 0];
    const [r, g, b] = rgb.map(v => v / 255);
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    
    // Increase lightness to improve contrast (target 40-60% for good visibility)
    l = Math.max(0.4, Math.min(0.6, l + 0.15));
    
    // Convert back to hex
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r2, g2, b2;
    if (h < 1/6) [r2, g2, b2] = [c, x, 0];
    else if (h < 2/6) [r2, g2, b2] = [x, c, 0];
    else if (h < 3/6) [r2, g2, b2] = [0, c, x];
    else if (h < 4/6) [r2, g2, b2] = [0, x, c];
    else if (h < 5/6) [r2, g2, b2] = [x, 0, c];
    else [r2, g2, b2] = [c, 0, x];
    
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
  }
  
  return baseColor;
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

    // 3. Use middleware to process, sort, and select best tracks
    const rawTracks: ITunesTrack[] = data.results;
    const uniqueTracks = removeDuplicates(rawTracks);
    const selectedTracks = processMusicData(uniqueTracks, query, {
        maxResults: 6,
        prioritizePopularity: true,
        ensureGenreDiversity: true,
    });

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

    // 4. Convert selected tracks to Song format with cleaned titles
    const songs: Song[] = selectedTracks.map((track: ITunesTrack, index: number) => {
        // Mix genre and artist for unique body color (cassette body)
        const baseColor = stringToColor(track.primaryGenreName + track.artistName + "v2", false, false); 
        // Use track name for label tint
        const accentColor = stringToColor(track.trackName, true, false); 
        // For vinyl, use darker palette
        const vinylColor = stringToColor(track.primaryGenreName + track.artistName + "vinyl", false, true);
        
        const cleanedTitle = cleanTitle(track.trackName);
        const cleanedArtist = track.artistName.trim();

        return {
            id: `itunes-${track.trackId}-${Math.random().toString(36).substr(2, 5)}`, // Append random string to ID to ensure uniqueness on repeated searches
            title: cleanedTitle,
            artist: cleanedArtist,
            color: baseColor, // Cassette body color
            accentColor: accentColor, // Label color
            vinylColor: vinylColor, // Vinyl-specific color
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
