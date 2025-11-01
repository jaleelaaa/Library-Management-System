/**
 * Simple HTML tag removal regex
 */
const HTML_TAG_REGEX = /<[^>]*>/g;

/**
 * Dangerous characters that could be used for XSS
 */
const DANGEROUS_CHARS_REGEX = /[<>'"`;(){}[\]\\]/g;

/**
 * Sanitizes user input to prevent XSS attacks
 * @param dirty - The potentially unsafe string to sanitize
 * @returns Sanitized string safe for rendering
 */
export const sanitize = (dirty: string): string => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Remove HTML tags and dangerous characters
  return dirty
    .replace(HTML_TAG_REGEX, '')
    .replace(DANGEROUS_CHARS_REGEX, '')
    .trim();
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

  // Remove HTML tags but keep alphanumeric, spaces, and common punctuation
  const cleaned = query
    .replace(HTML_TAG_REGEX, '')
    .replace(/[<>'"`;{}[\]\\]/g, ''); // Remove dangerous chars but keep @ . - _ for emails/usernames

  // Trim and remove excessive whitespace
  return cleaned.trim().replace(/\s+/g, ' ');
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

  // Remove HTML tags but keep content
  return input
    .replace(HTML_TAG_REGEX, '')
    .replace(/[<>'"`;{}[\]\\]/g, '')
    .trim();
};

/**
 * Sanitizes HTML content that may contain rich text
 * For basic use cases - removes all HTML tags
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML (text only)
 */
export const sanitizeRichText = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Simple approach: strip all HTML tags for security
  return html
    .replace(HTML_TAG_REGEX, '')
    .replace(/[<>'"`;]/g, '')
    .trim();
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

  // Remove dangerous characters
  const cleaned = url.replace(/[<>'"`;{}[\]\\]/g, '').trim();

  // Validate that it's a safe URL
  try {
    const urlObj = new URL(cleaned);
    const allowedProtocols = ['http:', 'https:', 'mailto:'];

    if (allowedProtocols.includes(urlObj.protocol)) {
      return cleaned;
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
