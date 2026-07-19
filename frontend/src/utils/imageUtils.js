
export const getImageUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return `${baseUrl}${url}`;
};
