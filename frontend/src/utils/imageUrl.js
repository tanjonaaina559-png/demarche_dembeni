/**
 * imageUrl.js — Utility to build absolute image URLs
 *
 * Backend stores paths like: "uploads/procedures/proc-123.jpg"
 * Backend serves at:        http://localhost:5000/uploads/...
 *
 * This helper converts any stored relative path to a fully qualified URL
 * so images load correctly regardless of where the frontend is hosted.
 */

const API_BASE =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

/**
 * Converts a stored file path to a usable image URL.
 *
 * @param {string|null|undefined} path - e.g. "uploads/procedures/proc-123.jpg"
 *   or "/uploads/media/file-456.png" or a full https:// URL
 * @param {string} [fallback=''] - URL to return when path is empty/null
 * @returns {string} A fully qualified URL ready to use in <img src="..." />
 *
 * Examples:
 *   getImageUrl('uploads/procedures/foo.jpg')
 *   → 'http://localhost:5000/uploads/procedures/foo.jpg'
 *
 *   getImageUrl('/uploads/media/bar.png')
 *   → 'http://localhost:5000/uploads/media/bar.png'
 *
 *   getImageUrl('https://images.unsplash.com/...')
 *   → 'https://images.unsplash.com/...'  (returned unchanged)
 *
 *   getImageUrl(null, 'https://via.placeholder.com/400')
 *   → 'https://via.placeholder.com/400'
 */
export function getImageUrl(path, fallback = '') {
  const defaultPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3C/svg%3E";
  const finalFallback = fallback || defaultPlaceholder;

  if (!path) return finalFallback;

  // Already an absolute URL → return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Normalise Windows backslashes
  const normalised = path.replace(/\\/g, '/');

  // Ensure single leading slash before joining with base
  const withSlash = normalised.startsWith('/') ? normalised : `/${normalised}`;

  return `${API_BASE}${withSlash}`;
}

export default getImageUrl;
