import DOMPurify from 'dompurify';

/**
 * Configuration for DOMPurify sanitization
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_TRUSTED_TYPE: false,
};

/**
 * Sanitizes user input to prevent XSS attacks
 * @param dirty - The potentially unsafe string to sanitize
 * @param config - Optional custom DOMPurify configuration
 * @returns Sanitized string safe for rendering
 */
export const sanitize = (
  dirty: string,
  config: DOMPurify.Config = SANITIZE_CONFIG
): string => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirty, config);
};

/**
 * Sanitizes user input for search queries
 * Removes all HTML tags and special characters that could be used for XSS
 * @param query - The search query to sanitize
 * @returns Sanitized search query
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Remove all HTML tags
  const withoutTags = DOMPurify.sanitize(query, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });

  // Trim and remove excessive whitespace
  return withoutTags.trim().replace(/\s+/g, ' ');
};

/**
 * Sanitizes form input values
 * Allows basic formatting but removes potentially dangerous content
 * @param input - The form input to sanitize
 * @returns Sanitized input value
 */
export const sanitizeFormInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  }).trim();
};

/**
 * Sanitizes HTML content that may contain rich text
 * Allows more formatting tags for rich text editors
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML
 */
export const sanitizeRichText = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'span', 'div',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'a'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Creates a safe URL by sanitizing the input
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove any potentially dangerous protocols
  const sanitized = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });

  // Validate that it's a safe URL
  try {
    const urlObj = new URL(sanitized);
    const allowedProtocols = ['http:', 'https:', 'mailto:'];

    if (allowedProtocols.includes(urlObj.protocol)) {
      return sanitized;
    }
  } catch {
    // Invalid URL, return empty string
    return '';
  }

  return '';
};

/**
 * React hook for sanitizing input
 * @returns Object with sanitization functions
 */
export const useSanitize = () => {
  return {
    sanitize,
    sanitizeSearchQuery,
    sanitizeFormInput,
    sanitizeRichText,
    sanitizeUrl,
  };
};

export default {
  sanitize,
  sanitizeSearchQuery,
  sanitizeFormInput,
  sanitizeRichText,
  sanitizeUrl,
  useSanitize,
};
