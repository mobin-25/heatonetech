export const getApiUrl = (path: string): string => {
  const host = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : 'localhost';
  return `http://${host}:8000${path}`;
};
