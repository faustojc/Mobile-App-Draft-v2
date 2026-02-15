const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const exclusionList =
  require("metro-config/private/defaults/exclusionList").default;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    blacklistRE: exclusionList([
      /android\/.*/,
      /ios\/.*/,
      /.*\.gradle\/.*/,
      /node_modules\/.*\/node_modules\/.*/,
    ]),
  },
  watchFolders: [__dirname],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
