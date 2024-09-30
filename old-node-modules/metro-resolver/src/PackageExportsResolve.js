"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.isSubpathDefinedInExports = isSubpathDefinedInExports;
exports.resolvePackageTargetFromExports = resolvePackageTargetFromExports;
var _InvalidPackageConfigurationError = _interopRequireDefault(
  require("./errors/InvalidPackageConfigurationError")
);
var _PackagePathNotExportedError = _interopRequireDefault(
  require("./errors/PackagePathNotExportedError")
);
var _resolveAsset = _interopRequireDefault(require("./resolveAsset"));
var _isAssetFile = _interopRequireDefault(require("./utils/isAssetFile"));
var _toPosixPath = _interopRequireDefault(require("./utils/toPosixPath"));
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function resolvePackageTargetFromExports(
  context,
  packagePath,
  modulePath,
  packageRelativePath,
  exportsField,
  platform
) {
  const createConfigError = (reason) => {
    return new _InvalidPackageConfigurationError.default({
      reason,
      packagePath,
    });
  };
  const subpath = getExportsSubpath(packageRelativePath);
  const exportMap = normalizeExportsField(exportsField, createConfigError);
  if (!isSubpathDefinedInExports(exportMap, subpath)) {
    throw new _PackagePathNotExportedError.default(
      `Attempted to import the module "${modulePath}" which is not listed ` +
        `in the "exports" of "${packagePath}" under the requested subpath ` +
        `"${subpath}".`
    );
  }
  const { target, patternMatch } = matchSubpathFromExports(
    context,
    subpath,
    exportMap,
    platform,
    createConfigError
  );
  if (target != null) {
    const invalidSegmentInTarget = findInvalidPathSegment(target.slice(2));
    if (invalidSegmentInTarget != null) {
      throw createConfigError(
        `The target for "${subpath}" defined in "exports" is "${target}", ` +
          "however this value is an invalid subpath or subpath pattern " +
          `because it includes "${invalidSegmentInTarget}".`
      );
    }
    const filePath = _path.default.join(
      packagePath,
      patternMatch != null ? target.replace("*", patternMatch) : target
    );
    if ((0, _isAssetFile.default)(filePath, context.assetExts)) {
      const assetResult = (0, _resolveAsset.default)(context, filePath);
      if (assetResult != null) {
        return assetResult;
      }
    }
    if (context.unstable_fileSystemLookup != null) {
      const lookupResult = context.unstable_fileSystemLookup(filePath);
      if (lookupResult.exists && lookupResult.type === "f") {
        return {
          type: "sourceFile",
          filePath: lookupResult.realPath,
        };
      }
    } else if (context.doesFileExist(filePath)) {
      return {
        type: "sourceFile",
        filePath,
      };
    }
    throw createConfigError(
      `The resolution for "${modulePath}" defined in "exports" is ${filePath}, ` +
        "however this file does not exist."
    );
  }
  throw new _PackagePathNotExportedError.default(
    `Attempted to import the module "${modulePath}" which is listed in the ` +
      `"exports" of "${packagePath}", however no match was resolved for this ` +
      `request (platform = ${platform ?? "null"}).`
  );
}
function getExportsSubpath(packageSubpath) {
  return packageSubpath === ""
    ? "."
    : "./" + (0, _toPosixPath.default)(packageSubpath);
}
const _normalizedExportsFields = new WeakMap();
function normalizeExportsField(exportsField, createConfigError) {
  let rootValue;
  if (typeof exportsField === "string") {
    return new Map([[".", exportsField]]);
  }
  const cachedValue = _normalizedExportsFields.get(exportsField);
  if (cachedValue) {
    return cachedValue;
  }
  if (Array.isArray(exportsField)) {
    if (exportsField.every((value) => typeof value === "string")) {
      rootValue = exportsField.find((value) => value.startsWith("./"));
    } else {
      rootValue = exportsField[0];
    }
  } else {
    rootValue = exportsField;
  }
  if (rootValue == null || Array.isArray(rootValue)) {
    throw createConfigError(
      'Could not parse non-standard array value at root of "exports" field.'
    );
  }
  if (typeof rootValue === "string") {
    const result = new Map([[".", rootValue]]);
    _normalizedExportsFields.set(exportsField, result);
    return result;
  }
  const firstLevelKeys = Object.keys(rootValue);
  const subpathKeys = firstLevelKeys.filter((subpathOrCondition) =>
    subpathOrCondition.startsWith(".")
  );
  if (subpathKeys.length === firstLevelKeys.length) {
    const result = new Map(
      Object.entries(flattenLegacySubpathValues(rootValue, createConfigError))
    );
    _normalizedExportsFields.set(exportsField, result);
    return result;
  }
  if (subpathKeys.length !== 0) {
    throw createConfigError(
      'The "exports" field cannot have keys which are both subpaths and ' +
        "condition names at the same level."
    );
  }
  const result = new Map([
    [".", flattenLegacySubpathValues(rootValue, createConfigError)],
  ]);
  _normalizedExportsFields.set(exportsField, result);
  return result;
}
function flattenLegacySubpathValues(exportMap, createConfigError) {
  return Object.entries(exportMap).reduce((result, [subpath, value]) => {
    if (Array.isArray(value)) {
      if (!value.length || Array.isArray(value[0])) {
        throw createConfigError(
          'Could not parse non-standard array value in "exports" field.'
        );
      }
      result[subpath] = value[0];
    } else {
      result[subpath] = value;
    }
    return result;
  }, {});
}
function isSubpathDefinedInExports(exportMap, subpath) {
  if (exportMap.has(subpath)) {
    return true;
  }
  for (const key of exportMap.keys()) {
    if (
      key.split("*").length === 2 &&
      matchSubpathPattern(key, subpath) != null
    ) {
      return true;
    }
  }
  return false;
}
function matchSubpathFromExports(
  context,
  subpath,
  exportMap,
  platform,
  createConfigError
) {
  const conditionNames = new Set([
    "default",
    ...context.unstable_conditionNames,
    ...(platform != null
      ? context.unstable_conditionsByPlatform[platform] ?? []
      : []),
  ]);
  const exportMapAfterConditions = reduceExportMap(
    exportMap,
    conditionNames,
    createConfigError
  );
  let target = exportMapAfterConditions.get(subpath);
  let patternMatch = null;
  if (target == null) {
    const expansionKeys = [...exportMapAfterConditions.keys()]
      .filter((key) => key.includes("*"))
      .sort((key) => key.split("*")[0].length)
      .reverse();
    for (const key of expansionKeys) {
      const value = exportMapAfterConditions.get(key);
      if (typeof value === "string" && value.split("*").length !== 2) {
        break;
      }
      patternMatch = matchSubpathPattern(key, subpath);
      if (patternMatch != null) {
        target = value;
        break;
      }
    }
  }
  return {
    target: target ?? null,
    patternMatch,
  };
}
function reduceExportMap(exportMap, conditionNames, createConfigError) {
  const result = new Map();
  for (const [subpath, value] of exportMap) {
    const subpathValue = reduceConditionalExport(value, conditionNames);
    if (subpathValue !== "no-match") {
      result.set(subpath, subpathValue);
    }
  }
  for (const value of result.values()) {
    if (value != null && !value.startsWith("./")) {
      throw createConfigError(
        'One or more mappings for subpaths defined in "exports" are invalid. ' +
          'All values must begin with "./".'
      );
    }
  }
  return result;
}
function reduceConditionalExport(subpathValue, conditionNames) {
  let reducedValue = subpathValue;
  while (reducedValue != null && typeof reducedValue !== "string") {
    let match;
    if ("default" in reducedValue) {
      match = "no-match";
    } else {
      match = null;
    }
    for (const conditionName in reducedValue) {
      if (conditionNames.has(conditionName)) {
        match = reducedValue[conditionName];
        break;
      }
    }
    reducedValue = match;
  }
  return reducedValue;
}
function matchSubpathPattern(subpathPattern, subpath) {
  const [patternBase, patternTrailer] = subpathPattern.split("*");
  if (subpath.startsWith(patternBase) && subpath.endsWith(patternTrailer)) {
    return subpath.substring(
      patternBase.length,
      subpath.length - patternTrailer.length
    );
  }
  return null;
}
function findInvalidPathSegment(subpath) {
  for (const segment of subpath.split(/[\\/]/)) {
    if (
      segment === "" ||
      segment === "." ||
      segment === ".." ||
      segment === "node_modules"
    ) {
      return segment;
    }
  }
  return null;
}
