export const getApiUrl = (path: string): string => {
  const API_BASE_URL =
    import.meta.env.PROD
      ? 'https://heatonetech.onrender.com'
      : 'http://localhost:8000';

  return `${API_BASE_URL}${path}`;
};