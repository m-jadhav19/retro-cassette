
// Reliable MP3 URLs for defaults (Free Music Archive / Stable Sources)
export const DEMO_AUDIO_URL = "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3"; 

export const SFX = {
  CLICK: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.m4a",
  PLAY_CLICK: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.m4a",
  INSERT: "https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.m4a",
  EJECT: "https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.m4a", 
  MOTOR: "https://assets.mixkit.co/active_storage/sfx/1128/1128-preview.m4a",
  GRAB: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.m4a", // Plastic handling
  DROP: "https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.m4a"  // Plastic drop
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
