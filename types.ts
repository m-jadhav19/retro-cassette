
export interface Song {
  id: string;
  title: string;
  artist: string;
  color: string; // Hex code for the cassette body
  accentColor: string; // Hex code for label/details
  mood?: string;
  duration: string;
  audioUrl?: string; // URL to the preview track
  // Position state for the desk
  x?: number;
  y?: number;
  rotation?: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export enum PlayerStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED'
}
