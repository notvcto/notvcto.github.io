import { AppID } from '@/store/system';

export const terminalManifest = {
  id: 'terminal' as AppID,
  name: 'Terminal',
  icon: 'terminal',
  defaultSize: { width: 600, height: 400 },
  singleton: true, // Now handled by store anyway, but keeping metadata consistent
};
