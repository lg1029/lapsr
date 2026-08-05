/**
 * Production-safe logger. All output is suppressed in production builds.
 * __DEV__ is set to false by React Native's production bundler automatically.
 */

/**
 * Strips Axios request config (which may contain Authorization headers) from errors.
 * Always log sanitized errors — never the raw Axios error object.
 */
export function sanitizeError(e: unknown): string {
  if (e != null && typeof e === 'object') {
    const err = e as Record<string, any>;
    const status = err?.response?.status;
    const message = err?.message ?? String(e);
    return status != null ? `HTTP ${status}: ${message}` : message;
  }
  return String(e);
}

const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (__DEV__) console.error(...args);
  },
};

export default logger;
