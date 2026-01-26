export const associations: Record<string, string> = {
  '.txt': 'text-editor',
};

export const getAppForFile = (filename: string): string | null => {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  if (associations[ext]) {
    return associations[ext];
  }
  return null;
};
