export const getPostIcon = (tags = []) => {
  if (!tags) return 'gedit';
  if (tags.includes('terminal')) return 'terminal';
  if (tags.includes('vscode') || tags.includes('code')) return 'vscode';
  if (tags.includes('spotify')) return 'spotify';
  if (tags.includes('discord')) return 'discord';
  if (tags.includes('calc')) return 'calc';
  if (tags.includes('settings')) return 'settings';
  if (tags.includes('firefox') || tags.includes('browser')) return 'firefox';
  if (tags.includes('hackerone')) return 'hackerone';
  return 'gedit';
};
