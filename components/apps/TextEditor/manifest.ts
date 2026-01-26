import { AppManifest } from '../registry';
import TextEditor from './index';

export const manifest: AppManifest = {
  id: 'text-editor',
  name: 'Text Editor',
  icon: 'accessories-text-editor',
  singleton: false,
  entry: TextEditor,
  desktopShortcut: false,
  favourite: false
};
