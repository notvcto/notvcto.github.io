import { AppID } from '@/store/system';

export const vscodeManifest = {
  id: 'vscode' as AppID,
  name: 'VS Code',
  icon: 'code',
  defaultSize: { width: 900, height: 600 },
  singleton: true,
};
