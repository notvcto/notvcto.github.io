import { AppID } from '@/store/system';

export const aboutManifest = {
  id: 'about' as AppID,
  name: 'About Me',
  icon: 'person',
  defaultSize: { width: 600, height: 400 },
  singleton: true,
};
