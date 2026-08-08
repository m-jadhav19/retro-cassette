import insertSound from './components/audio/insert.mp3';
import ejectSound from './components/audio/eject.mp3';

export const SFX = {
  INSERT: insertSound,
  EJECT: ejectSound
};

// iTunes 30s preview URLs — reliable and CORS-friendly
export const DEFAULT_SONGS = [
  {
    id: 'default-1',
    title: 'Night Owl',
    artist: 'Galimatias',
    color: '#1e293b',
    accentColor: '#f1f5f9',
    duration: '0:30',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ab/16/ae/ab16aecd-2144-4915-de7b-7a31d199ff6a/mzaf_6454384337338963375.plus.aac.p.m4a',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/03/3e/97/033e974c-2e08-26f9-0fb4-6eb482c33bec/198846270036.jpg/300x300bb.jpg',
  },
  {
    id: 'default-2',
    title: 'Jazz (We\'ve Got)',
    artist: 'A Tribe Called Quest',
    color: '#0ea5e9',
    accentColor: '#f8fafc',
    duration: '0:30',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/1c/ca/dc/1ccadcad-a482-0df6-6b7b-b567f097165e/mzaf_2171187046549382956.plus.aac.p.m4a',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/d1/90/11/d1901153-4595-7f2f-12d2-661be9eef883/012414149022.jpg/300x300bb.jpg',
  },
  {
    id: 'default-3',
    title: 'Skating',
    artist: 'Vince Guaraldi Trio',
    color: '#b91c1c',
    accentColor: '#fef2f2',
    duration: '0:30',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/3f/ba/7a/3fba7adc-6f8f-7d07-97d0-598c0a96cb05/mzaf_4160561422652694479.plus.aac.p.m4a',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e8/83/ea/e883eade-52e2-fa74-fd1e-a69c114ef9ae/12CMGIM34347.rgb.jpg/300x300bb.jpg',
  },
];
