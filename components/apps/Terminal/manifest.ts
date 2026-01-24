import { AppID } from '@/store/system';

export const terminalManifest = {
  id: 'terminal' as AppID,
  name: 'Terminal',
  icon: 'terminal',
  defaultSize: { width: 600, height: 400 },
  singleton: false, // Explicitly multi-instance, though usually shells are
};
