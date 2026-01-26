export const getPostIcon = (tags = []) => {
  if (!tags) return 'text-x-generic';
  if (tags.includes('terminal')) return 'utilities-terminal';
  if (tags.includes('vscode') || tags.includes('code')) return 'vscode';
  if (tags.includes('spotify')) return 'spotify';
  if (tags.includes('discord')) return 'discord';
  if (tags.includes('calc')) return 'accessories-calculator';
  if (tags.includes('settings')) return 'gnome-control-center';
  if (tags.includes('firefox') || tags.includes('browser')) return 'firefox';
  if (tags.includes('hackerone')) return 'hackerone';
  return 'text-x-generic';
};
