/**
 * Secure Logger Utility
 * Wraps console methods to sanitize sensitive data and control verbosity based on environment.
 */

// Sensitive keys to redact
const SENSITIVE_KEYS = ['token', 'password', 'secret', 'key', 'auth', 'credential', 'email'];

// Recursive function to sanitize objects
function sanitize(arg: unknown, visited = new WeakSet<object>()): unknown {
  if (typeof arg === 'string') {
    // Basic regex to catch potential secrets in strings (e.g. "Bearer eyJ...")
    // This is a heuristic and not perfect.
    // Redact email-like strings
    let sanitized = arg.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
    // Redact Bearer tokens
    sanitized = sanitized.replace(/Bearer\s+[a-zA-Z0-9._-]+/g, 'Bearer [REDACTED_TOKEN]');
    return sanitized;
  }

  if (typeof arg === 'object' && arg !== null) {
    if (visited.has(arg)) {
      return '[Circular]';
    }
    visited.add(arg);
  }

  if (Array.isArray(arg)) {
    return arg.map((item) => sanitize(item, visited));
  }

  if (arg instanceof Error) {
    const sanitizedError: Record<string, unknown> = {
      name: arg.name,
      message: sanitize(arg.message, visited),
      stack: sanitize(arg.stack, visited),
    };
    // Include any custom properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorObj = arg as any;
    for (const key of Object.keys(errorObj)) {
      if (key !== 'name' && key !== 'message' && key !== 'stack') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        sanitizedError[key] = sanitize(errorObj[key], visited);
      }
    }
    return sanitizedError;
  }

  if (typeof arg === 'object' && arg !== null) {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(arg)) {
      // Check for exact match or typical variations
      // We want to match: "apiKey", "api_key", "password", "user_password"
      // But NOT match: "author", "keyboard", "monkey"

      const lowerKey = key.toLowerCase();

      // Check if any sensitive key is found as a distinct word part
      // This handles snake_case (e.g. "api_key") and camelCase (e.g. "apiKey")
      const isSensitive = SENSITIVE_KEYS.some((k) => {
        // 1. Exact match
        if (lowerKey === k) return true;

        // 2. Snake_case match: key is surrounded by _ or is at start/end
        if (lowerKey.includes(`_${k}_`) || lowerKey.startsWith(`${k}_`) || lowerKey.endsWith(`_${k}`)) return true;

        // 3. CamelCase match: "apiKey" -> "api" + "Key". We can just check if the key contains the sensitive word
        // AND the sensitive word is 'key' (special case) or others.
        // Actually, simpler heuristic:
        // if key contains the sensitive word, AND it's not in an allowlist of common false positives?
        // OR: just add specific complex logic.

        // Let's try: if the sensitive key is part of the string, check boundaries.
        // For camelCase "apiKey", "key" is at the end. "authToken", "token" is at end. "secretKey", "secret" at start.

        // Heuristic: sensitive key appears in the string.
        if (lowerKey.includes(k)) {
          // If it's "key", be stricter.
          if (k === 'key') {
             // For 'key', only redact if it's 'apiKey', 'secretKey', 'accessKey', etc.
             // Or if it stands alone.
             // "keyboard" -> contains key. "monkey" -> contains key.
             // "apiKey" -> contains key.

             // Check if it's one of the known compound patterns for "key"
             return lowerKey.includes('api') || lowerKey.includes('secret') || lowerKey.includes('access') || lowerKey.includes('public') || lowerKey.includes('private');
          }
           // For other keys like 'password', 'token', 'secret', 'auth', 'credential', 'email'
           // "author" contains "auth".
           if (k === 'auth') {
             return key.toLowerCase() !== 'author' && key.toLowerCase() !== 'authority' && !key.toLowerCase().includes('authenticate');
             // "authenticate" is probably not sensitive itself? Usually "authentication" or "authToken".
             // Let's keep it simple: if it equals "auth" or ends with "auth" or starts with "auth" or has "_auth_".
             // "authToken" -> starts with auth.
             // "userAuth" -> ends with auth.
           }

           return true;
        }
        return false;
      });

      if (isSensitive) {
        sanitizedObj[key] = '[REDACTED]';
      } else {
        sanitizedObj[key] = sanitize(value, visited);
      }
    }
    return sanitizedObj;
  }

  return arg;
}

const isProduction = import.meta.env.PROD;

export const logger = {
  info: (...args: unknown[]) => {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.log(...args.map((arg) => sanitize(arg)));
    }
  },
  warn: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(...args.map((arg) => sanitize(arg)));
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(...args.map((arg) => sanitize(arg)));
  },
  debug: (...args: unknown[]) => {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.debug(...args.map((arg) => sanitize(arg)));
    }
  },
};
