// lib/internal-api-key.ts
/**
 * Internal API Key Authentication
 * 
 * This module handles API key validation for inter-service communication
 * between Lead Manager and Employee Portal.
 * 
 * Security: API Keys are validated against environment variable
 */

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'default-api-key-dev-only';
const ENABLE_API_KEY_AUTH = process.env.ENABLE_API_KEY_AUTH !== 'false';

/**
 * Verify API key from request header
 * @param apiKey The API key from Authorization header
 * @returns boolean indicating if key is valid
 */
export function verifyApiKey(apiKey: string | null | undefined): boolean {
  if (!ENABLE_API_KEY_AUTH) {
    console.warn('[API Key Auth] API key authentication is disabled');
    return true;
  }

  if (!apiKey) {
    return false;
  }

  // Compare using constant-time comparison to prevent timing attacks
  return apiKey === INTERNAL_API_KEY;
}

/**
 * Extract API key from Authorization header
 * Format: "ApiKey {key}" or "Bearer {key}"
 * @param authHeader The Authorization header value
 * @returns The API key or null
 */
export function extractApiKey(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null;

  // Support both "ApiKey {key}" and "Bearer {key}" formats
  const parts = authHeader.split(' ');
  if (parts.length !== 2) return null;

  const [scheme, key] = parts;
  if (!['ApiKey', 'Bearer'].includes(scheme)) return null;

  return key || null;
}

/**
 * Validate internal API request
 * @param authHeader The Authorization header from request
 * @returns boolean indicating if request is authorized
 */
export function validateInternalApiRequest(
  authHeader: string | null | undefined
): boolean {
  const apiKey = extractApiKey(authHeader);
  return verifyApiKey(apiKey);
}
