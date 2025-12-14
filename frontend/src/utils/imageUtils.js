/**
 * Utility functions for handling image URLs
 */

/**
 * Ensures an image URL is absolute and accessible
 * @param {string} imageUrl - The image URL from the backend
 * @returns {string} - Absolute URL that can be accessed from the frontend
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return 'https://via.placeholder.com/300x200?text=Sweet+Image';
  }

  // If already an absolute URL (starts with http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative URL starting with /uploads, make it absolute
  if (imageUrl.startsWith('/uploads')) {
    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${apiBaseUrl}${imageUrl}`;
  }

  // If it's a relative URL without leading slash, add it
  if (imageUrl.startsWith('uploads')) {
    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${apiBaseUrl}/${imageUrl}`;
  }

  // If it's just a filename, assume it's in uploads folder
  if (imageUrl && !imageUrl.includes('/') && !imageUrl.includes('http')) {
    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${apiBaseUrl}/uploads/${imageUrl}`;
  }

  // Default fallback
  return imageUrl;
};

/**
 * Handles image load errors
 * @param {Event} e - The error event
 * @param {string} originalUrl - The original image URL
 */
export const handleImageError = (e, originalUrl) => {
  console.error('Image load error:', {
    originalUrl,
    currentSrc: e.target.src,
    error: e.type
  });
  
  // Try to fix the URL if it's relative
  const fixedUrl = getImageUrl(originalUrl);
  
  // If the fixed URL is different, try it
  if (fixedUrl !== originalUrl && fixedUrl !== e.target.src) {
    console.log('Attempting to load with fixed URL:', fixedUrl);
    e.target.src = fixedUrl;
    return;
  }

  // If still fails, use placeholder
  console.log('Using placeholder image');
  e.target.src = 'https://via.placeholder.com/300x200?text=Sweet+Image';
  e.target.onerror = null; // Prevent infinite loop
};

