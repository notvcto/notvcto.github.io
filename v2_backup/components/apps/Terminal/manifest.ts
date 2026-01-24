import { AppID } from '@/store/system';

export const terminalManifest = {
  id: 'terminal' as AppID,
  name: 'Terminal',
  icon: 'terminal',
  defaultSize: { width: 700, height: 500 },
  singleton: true, // v1 seems to allow multiple but let's stick to the "strict singleton" rule for now unless user complains
};
