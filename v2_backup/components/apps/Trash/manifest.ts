import { AppID } from '@/store/system';

export const trashManifest = {
  id: 'trash' as AppID,
  name: 'Trash',
  icon: 'delete', // Using Material 'delete' instead of custom svg for now
  defaultSize: { width: 400, height: 300 },
  singleton: true,
};
