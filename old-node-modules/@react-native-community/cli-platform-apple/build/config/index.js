"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getProjectConfig = exports.getDependencyConfig = exports.findPodfilePaths = void 0;
function _chalk() {
  const data = _interopRequireDefault(require("chalk"));
  _chalk = function () {
    return data;
  };
  return data;
}
function _path() {
  const data = _interopRequireDefault(require("path"));
  _path = function () {
    return data;
  };
  return data;
}
function _fs() {
  const data = _interopRequireDefault(require("fs"));
  _fs = function () {
    return data;
  };
  return data;
}
var _findPodfilePath = _interopRequireDefault(require("./findPodfilePath"));
var _findXcodeProject = _interopRequireDefault(require("./findXcodeProject"));
var _findPodspec = _interopRequireDefault(require("./findPodspec"));
var _findAllPodfilePaths = _interopRequireDefault(require("./findAllPodfilePaths"));
function _cliTools() {
  const data = require("@react-native-community/cli-tools");
  _cliTools = function () {
    return data;
  };
  return data;
}
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Returns project config by analyzing given folder and applying some user defaults
 * when constructing final object
 */
const getProjectConfig = ({
  platformName
}) => (folder, userConfig) => {
  if (!userConfig) {
    return null;
  }
  const src = _path().default.join(folder, userConfig.sourceDir ?? '');
  const podfile = (0, _findPodfilePath.default)(src, platformName);

  /**
   * In certain repos, the Xcode project can be generated by a tool.
   * The only file that we can assume to exist on disk is `Podfile`.
   */
  if (!podfile) {
    return null;
  }
  const sourceDir = _path().default.dirname(podfile);
  const xcodeProject = (0, _findXcodeProject.default)(_fs().default.readdirSync(sourceDir));

  // @ts-ignore @todo remove for RN 0.75
  if (userConfig.unstable_reactLegacyComponentNames) {
    _cliTools().logger.warn('The "project.ios.unstable_reactLegacyComponentNames" config option is not necessary anymore for React Native 0.74 and does nothing. Please remove it from the "react-native.config.js" file.');
  }
  return {
    sourceDir,
    watchModeCommandParams: userConfig.watchModeCommandParams,
    xcodeProject,
    automaticPodsInstallation: userConfig.automaticPodsInstallation,
    assets: userConfig.assets ?? []
  };
};

/**
 * Make getDependencyConfig follow the same pattern as getProjectConfig
 */
exports.getProjectConfig = getProjectConfig;
const getDependencyConfig = ({}) => (folder, userConfig = {}) => {
  if (userConfig === null) {
    return null;
  }
  const podspecPath = (0, _findPodspec.default)(folder);
  if (!podspecPath) {
    return null;
  }
  let version = 'unresolved';
  try {
    const packageJson = require(_path().default.join(folder, 'package.json'));
    if (packageJson.version) {
      version = packageJson.version;
    }
  } catch {
    throw new (_cliTools().CLIError)(`Failed to locate package.json file from ${_chalk().default.underline(folder)}. This is most likely issue with your node_modules folder being corrupted. Please force install dependencies and try again`);
  }
  return {
    podspecPath,
    version,
    configurations: userConfig.configurations || [],
    scriptPhases: userConfig.scriptPhases || []
  };
};
exports.getDependencyConfig = getDependencyConfig;
const findPodfilePaths = _findAllPodfilePaths.default;
exports.findPodfilePaths = findPodfilePaths;

//# sourceMappingURL=/Users/thymikee/Developer/oss/rncli/packages/cli-platform-apple/build/config/index.js.map