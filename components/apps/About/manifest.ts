import { AppID } from '@/store/system';

export const aboutManifest = {
  id: 'about' as AppID,
  name: 'About Me',
  icon: 'person', // We can update this to use the copied assets later if desired, for now Material Icons
  defaultSize: { width: 600, height: 400 },
  singleton: true,
};
