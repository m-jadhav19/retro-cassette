import insertSound from './components/audio/insert.mp3';
import ejectSound from './components/audio/eject.mp3';

// Reliable MP3 URLs for defaults (Free Music Archive / Stable Sources)
export const DEMO_AUDIO_URL = "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3"; 

export const SFX = {
  INSERT: insertSound,
  EJECT: ejectSound
};

export const DEFAULT_SONGS = [
  {
    id: 'default-1',
    title: 'Synthwave Chill',
    artist: 'Retro Vibes',
    color: '#1e293b', // Dark Slate
    accentColor: '#f1f5f9',
    duration: '0:30',
    audioUrl: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3" 
  },
  {
    id: 'default-2',
    title: 'Upbeat Pop',
    artist: 'Summer Hits',
    color: '#0ea5e9', // Sky Blue
    accentColor: '#f8fafc',
    duration: '0:30',
    audioUrl: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3"
  },
  {
    id: 'default-3',
    title: 'Rock Anthem',
    artist: 'The Classics',
    color: '#b91c1c', // Red
    accentColor: '#fef2f2',
    duration: '0:30',
    audioUrl: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3"
  }
];
