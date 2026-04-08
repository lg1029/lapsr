/**
 * Production-safe logger. All output is suppressed in production builds.
 * __DEV__ is set to false by React Native's production bundler automatically.
 */
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
