const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// In production, Hermes compiles the JS bundle to bytecode,
// which is not human-readable and provides the primary obfuscation layer.
//
// Additional hardening applied here:
// - drop_console: removes all console.* calls from the production bundle
//   (complements logger.ts which already guards on __DEV__, belt-and-suspenders)
// - mangle: shortens variable and function names
// - Source maps are NOT generated for production builds (no config needed —
//   just never pass --source-maps to eas build)
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    compress: {
      drop_console: true,
    },
    mangle: true,
  },
};

module.exports = config;
