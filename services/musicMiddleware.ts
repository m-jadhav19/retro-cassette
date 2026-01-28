import { Song } from '../types';

/**
 * Interface for raw iTunes API track data
 */
export interface ITunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  primaryGenreName?: string;
  trackTimeMillis?: number;
  previewUrl?: string;
  releaseDate?: string;
  trackPrice?: number;
  collectionPrice?: number;
  trackNumber?: number;
  discNumber?: number;
  country?: string;
  currency?: string;
  artworkUrl100?: string;
  artworkUrl60?: string;
  [key: string]: any;
}

/**
 * Enhanced track with scoring metadata
 */
interface ScoredTrack extends ITunesTrack {
  score: number;
  qualityScore: number;
  relevanceScore: number;
  diversityScore: number;
}

/**
 * Configuration for music selection
 */
interface SelectionConfig {
  maxResults?: number;
  minQualityScore?: number;
  prioritizePopularity?: boolean;
  ensureGenreDiversity?: boolean;
  preferRecentReleases?: boolean;
}

const DEFAULT_CONFIG: Required<SelectionConfig> = {
  maxResults: 6,
  minQualityScore: 0.3,
  prioritizePopularity: true,
  ensureGenreDiversity: true,
  preferRecentReleases: false,
};

/**
 * Calculate quality score based on track metadata
 */
const calculateQualityScore = (track: ITunesTrack): number => {
  let score = 0;
  const maxScore = 100;

  // Has preview URL (required, but give bonus if high quality)
  if (track.previewUrl) {
    score += 20;
  }

  // Has complete metadata
  if (track.trackName && track.artistName) {
    score += 15;
  }
  if (track.collectionName) {
    score += 10; // Album name indicates better metadata
  }
  if (track.primaryGenreName) {
    score += 10;
  }

  // Track duration (prefer tracks with reasonable length)
  if (track.trackTimeMillis) {
    const durationMinutes = track.trackTimeMillis / 60000;
    // Prefer tracks between 2-6 minutes (typical song length)
    if (durationMinutes >= 2 && durationMinutes <= 6) {
      score += 15;
    } else if (durationMinutes >= 1 && durationMinutes <= 10) {
      score += 10;
    } else {
      score += 5;
    }
  }

  // Has artwork (indicates better quality release)
  if (track.artworkUrl100 || track.artworkUrl60) {
    score += 10;
  }

  // Track number (indicates it's part of an album, not a single)
  if (track.trackNumber && track.trackNumber > 0) {
    score += 5;
  }

  // Release date (prefer more recent releases, but not too recent)
  if (track.releaseDate) {
    try {
      const releaseDate = new Date(track.releaseDate);
      const now = new Date();
      const yearsSinceRelease = (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      // Prefer tracks from 1970-2020 (sweet spot for quality music)
      if (yearsSinceRelease >= 0 && yearsSinceRelease <= 50) {
        if (yearsSinceRelease >= 5 && yearsSinceRelease <= 30) {
          score += 15; // Classic era
        } else {
          score += 10;
        }
      }
    } catch (e) {
      // Invalid date, skip
    }
  }

  // Normalize to 0-1 range
  return Math.min(score / maxScore, 1);
};

/**
 * Calculate relevance score based on query matching
 */
const calculateRelevanceScore = (track: ITunesTrack, query: string): number => {
  if (!query) return 0.5;

  const queryLower = query.toLowerCase();
  const trackNameLower = track.trackName?.toLowerCase() || '';
  const artistNameLower = track.artistName?.toLowerCase() || '';
  const genreLower = track.primaryGenreName?.toLowerCase() || '';
  const albumLower = track.collectionName?.toLowerCase() || '';

  let score = 0;
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  // Exact match in title (highest priority)
  if (trackNameLower.includes(queryLower)) {
    score += 40;
  } else {
    // Word matches in title
    queryWords.forEach(word => {
      if (trackNameLower.includes(word)) {
        score += 15;
      }
    });
  }

  // Artist name match
  if (artistNameLower.includes(queryLower)) {
    score += 20;
  } else {
    queryWords.forEach(word => {
      if (artistNameLower.includes(word)) {
        score += 10;
      }
    });
  }

  // Genre match
  if (genreLower.includes(queryLower)) {
    score += 15;
  } else {
    queryWords.forEach(word => {
      if (genreLower.includes(word)) {
        score += 5;
      }
    });
  }

  // Album match (lower priority)
  queryWords.forEach(word => {
    if (albumLower.includes(word)) {
      score += 3;
    }
  });

  // Normalize to 0-1 range
  return Math.min(score / 100, 1);
};

/**
 * Calculate diversity score to ensure variety
 */
const calculateDiversityScore = (
  track: ITunesTrack,
  selectedTracks: ScoredTrack[],
  allTracks: ScoredTrack[]
): number => {
  if (selectedTracks.length === 0) return 1;

  let diversityScore = 1;

  // Penalize same artist
  const sameArtistCount = selectedTracks.filter(
    t => t.artistName.toLowerCase() === track.artistName.toLowerCase()
  ).length;
  diversityScore -= sameArtistCount * 0.3;

  // Penalize same genre
  if (track.primaryGenreName) {
    const sameGenreCount = selectedTracks.filter(
      t => t.primaryGenreName?.toLowerCase() === track.primaryGenreName.toLowerCase()
    ).length;
    diversityScore -= sameGenreCount * 0.2;
  }

  // Penalize same album
  if (track.collectionName) {
    const sameAlbumCount = selectedTracks.filter(
      t => t.collectionName?.toLowerCase() === track.collectionName.toLowerCase()
    ).length;
    diversityScore -= sameAlbumCount * 0.25;
  }

  // Bonus for unique genres in the pool
  if (track.primaryGenreName) {
    const genreFrequency = allTracks.filter(
      t => t.primaryGenreName?.toLowerCase() === track.primaryGenreName.toLowerCase()
    ).length;
    const totalTracks = allTracks.length;
    if (totalTracks > 0) {
      const genreRarity = 1 - (genreFrequency / totalTracks);
      diversityScore += genreRarity * 0.2;
    }
  }

  return Math.max(0, Math.min(1, diversityScore));
};

/**
 * Sort tracks by multiple criteria
 */
const sortTracks = (
  tracks: ScoredTrack[],
  config: Required<SelectionConfig>
): ScoredTrack[] => {
  return [...tracks].sort((a, b) => {
    // Primary sort: total score
    if (Math.abs(a.score - b.score) > 0.1) {
      return b.score - a.score;
    }

    // Secondary sort: quality score
    if (Math.abs(a.qualityScore - b.qualityScore) > 0.05) {
      return b.qualityScore - a.qualityScore;
    }

    // Tertiary sort: relevance
    if (Math.abs(a.relevanceScore - b.relevanceScore) > 0.05) {
      return b.relevanceScore - a.relevanceScore;
    }

    // Final sort: diversity (prefer more diverse)
    return b.diversityScore - a.diversityScore;
  });
};

/**
 * Select best tracks with diversity consideration
 */
const selectBestTracks = (
  scoredTracks: ScoredTrack[],
  config: Required<SelectionConfig>
): ScoredTrack[] => {
  if (!config.ensureGenreDiversity) {
    // Simple selection: just take top N
    return scoredTracks
      .filter(t => t.qualityScore >= config.minQualityScore)
      .slice(0, config.maxResults);
  }

  // Diversity-aware selection
  const selected: ScoredTrack[] = [];
  const remaining = [...scoredTracks].filter(t => t.qualityScore >= config.minQualityScore);
  const usedArtists = new Set<string>();
  const usedGenres = new Set<string>();
  const usedAlbums = new Set<string>();

  // First pass: select top tracks ensuring diversity
  for (const track of remaining) {
    if (selected.length >= config.maxResults) break;

    const artistKey = track.artistName.toLowerCase();
    const genreKey = track.primaryGenreName?.toLowerCase() || '';
    const albumKey = track.collectionName?.toLowerCase() || '';

    // Allow some duplicates but prefer diversity
    const artistCount = Array.from(usedArtists).filter(a => a === artistKey).length;
    const genreCount = Array.from(usedGenres).filter(g => g === genreKey).length;
    const albumCount = Array.from(usedAlbums).filter(a => a === albumKey).length;

    // Prefer tracks from different artists/genres/albums
    const isDiverse = 
      artistCount < 2 && // Max 2 tracks per artist
      genreCount < 3 && // Max 3 tracks per genre
      albumCount < 2;   // Max 2 tracks per album

    if (isDiverse || selected.length < 3) {
      // Always take first 3 best tracks, then enforce diversity
      selected.push(track);
      usedArtists.add(artistKey);
      if (genreKey) usedGenres.add(genreKey);
      if (albumKey) usedAlbums.add(albumKey);
    }
  }

  // If we don't have enough diverse tracks, fill with remaining best
  if (selected.length < config.maxResults) {
    const remainingTracks = remaining.filter(
      t => !selected.some(s => s.trackId === t.trackId)
    );
    selected.push(...remainingTracks.slice(0, config.maxResults - selected.length));
  }

  return selected.slice(0, config.maxResults);
};

/**
 * Main middleware function to process and select music tracks
 */
export const processMusicData = (
  tracks: ITunesTrack[],
  query: string = '',
  config: SelectionConfig = {}
): ITunesTrack[] => {
  if (!tracks || tracks.length === 0) {
    return [];
  }

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Filter out invalid tracks
  const validTracks = tracks.filter(
    track => track.previewUrl && track.trackName && track.artistName
  );

  if (validTracks.length === 0) {
    return [];
  }

  // Calculate scores for all tracks
  const scoredTracks: ScoredTrack[] = validTracks.map(track => {
    const qualityScore = calculateQualityScore(track);
    const relevanceScore = calculateRelevanceScore(track, query);
    const diversityScore = 1; // Will be recalculated during selection

    // Weighted total score
    let totalScore = 0;
    if (finalConfig.prioritizePopularity) {
      totalScore = qualityScore * 0.4 + relevanceScore * 0.4 + diversityScore * 0.2;
    } else {
      totalScore = qualityScore * 0.3 + relevanceScore * 0.5 + diversityScore * 0.2;
    }

    return {
      ...track,
      score: totalScore,
      qualityScore,
      relevanceScore,
      diversityScore,
    };
  });

  // Sort tracks
  const sortedTracks = sortTracks(scoredTracks, finalConfig);

  // Recalculate diversity scores based on sorted order
  const tracksWithDiversity: ScoredTrack[] = sortedTracks.map((track, index) => {
    const previousTracks = sortedTracks.slice(0, index);
    const diversityScore = calculateDiversityScore(track, previousTracks, sortedTracks);
    
    // Recalculate total score with updated diversity
    let totalScore = 0;
    if (finalConfig.prioritizePopularity) {
      totalScore = track.qualityScore * 0.4 + track.relevanceScore * 0.4 + diversityScore * 0.2;
    } else {
      totalScore = track.qualityScore * 0.3 + track.relevanceScore * 0.5 + diversityScore * 0.2;
    }

    return {
      ...track,
      score: totalScore,
      diversityScore,
    };
  });

  // Re-sort with updated diversity scores
  const finalSorted = sortTracks(tracksWithDiversity, finalConfig);

  // Select best tracks
  const selected = selectBestTracks(finalSorted, finalConfig);

  // Return original track format (without scoring metadata)
  return selected.map(({ score, qualityScore, relevanceScore, diversityScore, ...track }) => track);
};

/**
 * Remove duplicate tracks based on title and artist
 */
export const removeDuplicates = (tracks: ITunesTrack[]): ITunesTrack[] => {
  const seen = new Set<string>();
  const unique: ITunesTrack[] = [];

  for (const track of tracks) {
    const key = `${track.trackName?.toLowerCase().trim()}_${track.artistName?.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(track);
    }
  }

  return unique;
};

