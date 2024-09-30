"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;
var _Device = _interopRequireDefault(require("./Device"));
var _nullthrows = _interopRequireDefault(require("nullthrows"));
var _timers = require("timers");
var _url = _interopRequireDefault(require("url"));
var _ws = _interopRequireDefault(require("ws"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 * @oncall react_native
 */

// $FlowFixMe[cannot-resolve-module] libdef missing in RN OSS

// Import these from node:timers to get the correct Flow types.
// $FlowFixMe[cannot-resolve-module] libdef missing in RN OSS

const debug = require("debug")("Metro:InspectorProxy");
const WS_DEVICE_URL = "/inspector/device";
const WS_DEBUGGER_URL = "/inspector/debug";
const PAGES_LIST_JSON_URL = "/json";
const PAGES_LIST_JSON_URL_2 = "/json/list";
const PAGES_LIST_JSON_VERSION_URL = "/json/version";
const MAX_PONG_LATENCY_MS = 5000;
const DEBUGGER_HEARTBEAT_INTERVAL_MS = 10000;
const INTERNAL_ERROR_CODE = 1011;
/**
 * Main Inspector Proxy class that connects JavaScript VM inside Android/iOS apps and JS debugger.
 */
class InspectorProxy {
  // Root of the project used for relative to absolute source path conversion.
  #projectRoot;

  /** The base URL to the dev server from the developer machine. */
  #serverBaseUrl;

  // Maps device ID to Device instance.
  #devices;

  // Internal counter for device IDs -- just gets incremented for each new device.
  #deviceCounter = 0;
  #eventReporter;
  #experiments;

  // custom message handler factory allowing implementers to handle unsupported CDP messages.
  #customMessageHandler;
  constructor(
    projectRoot,
    serverBaseUrl,
    eventReporter,
    experiments,
    customMessageHandler
  ) {
    this.#projectRoot = projectRoot;
    this.#serverBaseUrl = serverBaseUrl;
    this.#devices = new Map();
    this.#eventReporter = eventReporter;
    this.#experiments = experiments;
    this.#customMessageHandler = customMessageHandler;
  }
  getPageDescriptions() {
    // Build list of pages from all devices.
    let result = [];
    Array.from(this.#devices.entries()).forEach(([deviceId, device]) => {
      result = result.concat(
        device
          .getPagesList()
          .map((page) => this.#buildPageDescription(deviceId, device, page))
      );
    });
    return result;
  }

  // Process HTTP request sent to server. We only respond to 2 HTTP requests:
  // 1. /json/version returns Chrome debugger protocol version that we use
  // 2. /json and /json/list returns list of page descriptions (list of inspectable apps).
  // This list is combined from all the connected devices.
  processRequest(request, response, next) {
    const pathname = _url.default.parse(request.url).pathname;
    if (
      pathname === PAGES_LIST_JSON_URL ||
      pathname === PAGES_LIST_JSON_URL_2
    ) {
      this.#sendJsonResponse(response, this.getPageDescriptions());
    } else if (pathname === PAGES_LIST_JSON_VERSION_URL) {
      this.#sendJsonResponse(response, {
        Browser: "Mobile JavaScript",
        "Protocol-Version": "1.1",
      });
    } else {
      next();
    }
  }
  createWebSocketListeners() {
    return {
      [WS_DEVICE_URL]: this.#createDeviceConnectionWSServer(),
      [WS_DEBUGGER_URL]: this.#createDebuggerConnectionWSServer(),
    };
  }

  // Converts page information received from device into PageDescription object
  // that is sent to debugger.
  #buildPageDescription(deviceId, device, page) {
    const { host, protocol } = new URL(this.#serverBaseUrl);
    const webSocketScheme = protocol === "https:" ? "wss" : "ws";
    const webSocketUrlWithoutProtocol = `${host}${WS_DEBUGGER_URL}?device=${deviceId}&page=${page.id}`;
    // For now, `/json/list` returns the legacy built-in `devtools://` URL, to
    // preserve existing handling by Flipper. This may return a placeholder in
    // future -- please use the `/open-debugger` endpoint.
    const devtoolsFrontendUrl =
      `devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&${webSocketScheme}=` +
      encodeURIComponent(webSocketUrlWithoutProtocol);
    return {
      id: `${deviceId}-${page.id}`,
      title: page.title,
      description: page.app,
      type: "node",
      devtoolsFrontendUrl,
      webSocketDebuggerUrl: `${webSocketScheme}://${webSocketUrlWithoutProtocol}`,
      ...(page.vm != null
        ? {
            vm: page.vm,
          }
        : null),
      deviceName: device.getName(),
      reactNative: {
        logicalDeviceId: deviceId,
        capabilities: (0, _nullthrows.default)(page.capabilities),
      },
    };
  }

  // Sends object as response to HTTP request.
  // Just serializes object using JSON and sets required headers.
  #sendJsonResponse(response, object) {
    const data = JSON.stringify(object, null, 2);
    response.writeHead(200, {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-cache",
      "Content-Length": Buffer.byteLength(data).toString(),
      Connection: "close",
    });
    response.end(data);
  }

  // Adds websocket handler for device connections.
  // Device connects to /inspector/device and passes device and app names as
  // HTTP GET params.
  // For each new websocket connection we parse device and app names and create
  // new instance of Device class.
  #createDeviceConnectionWSServer() {
    const wss = new _ws.default.Server({
      noServer: true,
      perMessageDeflate: true,
      // Don't crash on exceptionally large messages - assume the device is
      // well-behaved and the debugger is prepared to handle large messages.
      maxPayload: 0,
    });
    // $FlowFixMe[value-as-type]
    wss.on("connection", async (socket, req) => {
      try {
        const fallbackDeviceId = String(this.#deviceCounter++);
        const query = _url.default.parse(req.url || "", true).query || {};
        const deviceId = query.device || fallbackDeviceId;
        const deviceName = query.name || "Unknown";
        const appName = query.app || "Unknown";
        const oldDevice = this.#devices.get(deviceId);
        const newDevice = new _Device.default(
          deviceId,
          deviceName,
          appName,
          socket,
          this.#projectRoot,
          this.#eventReporter,
          this.#customMessageHandler
        );
        if (oldDevice) {
          oldDevice.handleDuplicateDeviceConnection(newDevice);
        }
        this.#devices.set(deviceId, newDevice);
        debug(
          `Got new connection: name=${deviceName}, app=${appName}, device=${deviceId}`
        );
        socket.on("close", () => {
          this.#devices.delete(deviceId);
          debug(`Device ${deviceName} disconnected.`);
        });
      } catch (e) {
        console.error("error", e);
        socket.close(INTERNAL_ERROR_CODE, e?.toString() ?? "Unknown error");
      }
    });
    return wss;
  }

  // Returns websocket handler for debugger connections.
  // Debugger connects to webSocketDebuggerUrl that we return as part of page description
  // in /json response.
  // When debugger connects we try to parse device and page IDs from the query and pass
  // websocket object to corresponding Device instance.
  #createDebuggerConnectionWSServer() {
    const wss = new _ws.default.Server({
      noServer: true,
      perMessageDeflate: false,
      // Don't crash on exceptionally large messages - assume the debugger is
      // well-behaved and the device is prepared to handle large messages.
      maxPayload: 0,
    });
    // $FlowFixMe[value-as-type]
    wss.on("connection", async (socket, req) => {
      try {
        const query = _url.default.parse(req.url || "", true).query || {};
        const deviceId = query.device;
        const pageId = query.page;
        if (deviceId == null || pageId == null) {
          throw new Error("Incorrect URL - must provide device and page IDs");
        }
        const device = this.#devices.get(deviceId);
        if (device == null) {
          throw new Error("Unknown device with ID " + deviceId);
        }
        this.#startHeartbeat(socket, DEBUGGER_HEARTBEAT_INTERVAL_MS);
        device.handleDebuggerConnection(socket, pageId, {
          userAgent: req.headers["user-agent"] ?? query.userAgent ?? null,
        });
      } catch (e) {
        console.error(e);
        socket.close(INTERNAL_ERROR_CODE, e?.toString() ?? "Unknown error");
        this.#eventReporter?.logEvent({
          type: "connect_debugger_frontend",
          status: "error",
          error: e,
        });
      }
    });
    return wss;
  }

  // Starts pinging the socket at the given interval. Compliant clients will
  // respond with pong frame. This serves both to detect when the client
  // has gone away without sending a close frame, and as a keepalive in cases
  // where proxies may drop idle connections (e.g., VS Code tunnels).
  //
  // https://datatracker.ietf.org/doc/html/rfc6455#section-5.5.2
  #startHeartbeat(socket, intervalMs) {
    let shouldSetTerminateTimeout = false;
    let terminateTimeout = null;
    const pingTimeout = (0, _timers.setTimeout)(() => {
      if (socket.readyState !== _ws.default.OPEN) {
        // May be connecting or closing, try again later.
        pingTimeout.refresh();
        return;
      }
      shouldSetTerminateTimeout = true;
      socket.ping(() => {
        if (!shouldSetTerminateTimeout) {
          // Sometimes, this `sent` callback fires later than
          // the actual pong reply.
          //
          // If any message came in between ping `sending` and `sent`,
          // then the connection exists; and we don't need to do anything.
          return;
        }
        shouldSetTerminateTimeout = false;
        terminateTimeout = (0, _timers.setTimeout)(() => {
          if (socket.readyState !== _ws.default.OPEN) {
            return;
          }
          // We don't use close() here because that initiates a closing handshake,
          // which will not complete if the other end has gone away - 'close'
          // would not be emitted.
          //
          // terminate() emits 'close' immediately, allowing us to handle it and
          // inform any clients.
          socket.terminate();
        }, MAX_PONG_LATENCY_MS).unref();
      });
    }, intervalMs).unref();
    const onAnyMessageFromDebugger = () => {
      shouldSetTerminateTimeout = false;
      terminateTimeout && (0, _timers.clearTimeout)(terminateTimeout);
      pingTimeout.refresh();
    };
    socket.on("pong", onAnyMessageFromDebugger);
    socket.on("message", onAnyMessageFromDebugger);
    socket.on("close", () => {
      shouldSetTerminateTimeout = false;
      terminateTimeout && (0, _timers.clearTimeout)(terminateTimeout);
      (0, _timers.clearTimeout)(pingTimeout);
    });
  }
}
exports.default = InspectorProxy;
