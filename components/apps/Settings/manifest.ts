import { AppID } from '@/store/system';

export const settingsManifest = {
  id: 'settings' as AppID,
  name: 'Settings',
  icon: 'settings',
  defaultSize: { width: 500, height: 400 },
  singleton: true,
};
