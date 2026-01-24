import { AppID } from '@/store/system';

export const spotifyManifest = {
  id: 'spotify' as AppID,
  name: 'Spotify',
  icon: 'music_note',
  defaultSize: { width: 400, height: 600 },
  singleton: true,
};
