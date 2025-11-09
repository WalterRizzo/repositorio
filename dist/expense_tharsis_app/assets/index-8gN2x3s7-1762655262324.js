import { EventEmitter } from "node:events";
import { Writable } from "node:stream";
const hrtime$1 = /* @__PURE__ */ Object.assign(function hrtime(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, { bigint: function bigint() {
  return BigInt(Date.now() * 1e6);
} });
class ReadStream {
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
}
class WriteStream {
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
}
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = () => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  };
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
const NODE_VERSION = "22.14.0";
class Process extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw /* @__PURE__ */ createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw /* @__PURE__ */ createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw /* @__PURE__ */ createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw /* @__PURE__ */ createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw /* @__PURE__ */ createNotImplementedError("process.kill");
  }
  abort() {
    throw /* @__PURE__ */ createNotImplementedError("process.abort");
  }
  dlopen() {
    throw /* @__PURE__ */ createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw /* @__PURE__ */ createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw /* @__PURE__ */ createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw /* @__PURE__ */ createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw /* @__PURE__ */ createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw /* @__PURE__ */ createNotImplementedError("process.openStdin");
  }
  assert() {
    throw /* @__PURE__ */ createNotImplementedError("process.assert");
  }
  binding() {
    throw /* @__PURE__ */ createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
}
const globalProcess = globalThis["process"];
const getBuiltinModule = globalProcess.getBuiltinModule;
const workerdProcess = getBuiltinModule("node:process");
const isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
const unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime$1,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
const { exit, features, platform } = workerdProcess;
const {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime2,
  // Always implemented by workerd
  nextTick
} = unenvProcess;
const {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert,
  disconnect,
  mainModule
} = unenvProcess;
const {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
const _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime2,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
globalThis.process = _process;
const noop = Object.assign(() => {
}, { __unenv__: true });
const _console = globalThis.console;
const _ignoreErrors = true;
const _stderr = new Writable();
const _stdout = new Writable();
const Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
const _times = /* @__PURE__ */ new Map();
const _stdoutErrorHandler = noop;
const _stderrErrorHandler = noop;
const workerdConsole = globalThis["console"];
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
globalThis.console = workerdConsole;
const _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
const _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
const nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
class PerformanceEntry {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
}
const PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
class PerformanceMeasure extends PerformanceEntry {
  entryType = "measure";
}
class PerformanceResourceTiming extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
}
class PerformanceObserverEntryList {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
}
class Performance {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
}
class PerformanceObserver {
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
}
const performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};
var GET_MATCH_RESULT = Symbol();
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw[key]();
  };
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};
var HtmlEscapedCallbackPhase = {
  Stringify: 1
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  {
    return resStr;
  }
};
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var Context = class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
};
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono$1 = class Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono$1({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = (method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  };
  this.match = match2;
  return match2(method, path);
}
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node$1 = class Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node$1();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node$1();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node$1();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};
var Hono2 = class extends Hono$1 {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var parse = (cookie, name) => {
  if (name && cookie.indexOf(name) === -1) {
    return {};
  }
  const pairs = cookie.trim().split(";");
  const parsedCookie = {};
  for (let pairStr of pairs) {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1) {
      continue;
    }
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName)) {
      continue;
    }
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }
    if (validCookieValueRegEx.test(cookieValue)) {
      parsedCookie[cookieName] = cookieValue.indexOf("%") !== -1 ? tryDecode(cookieValue, decodeURIComponent_) : cookieValue;
      if (name) {
        break;
      }
    }
  }
  return parsedCookie;
};
var _serialize = (name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (name.startsWith("__Secure-") && !opt.secure) {
    throw new Error("__Secure- Cookie must have Secure attributes");
  }
  if (name.startsWith("__Host-")) {
    if (!opt.secure) {
      throw new Error("__Host- Cookie must have Secure attributes");
    }
    if (opt.path !== "/") {
      throw new Error('__Host- Cookie must have Path attributes with "/"');
    }
    if (opt.domain) {
      throw new Error("__Host- Cookie must not have Domain attributes");
    }
  }
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    if (opt.maxAge > 3456e4) {
      throw new Error(
        "Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration."
      );
    }
    cookie += `; Max-Age=${opt.maxAge | 0}`;
  }
  if (opt.domain && opt.prefix !== "host") {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    if (opt.expires.getTime() - Date.now() > 3456e7) {
      throw new Error(
        "Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future."
      );
    }
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
  }
  if (opt.priority) {
    cookie += `; Priority=${opt.priority.charAt(0).toUpperCase() + opt.priority.slice(1)}`;
  }
  if (opt.partitioned) {
    if (!opt.secure) {
      throw new Error("Partitioned Cookie must have Secure attributes");
    }
    cookie += "; Partitioned";
  }
  return cookie;
};
var serialize = (name, value, opt) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
};
var getCookie = (c, key, prefix) => {
  const cookie = c.req.raw.headers.get("Cookie");
  {
    if (!cookie) {
      return void 0;
    }
    let finalKey = key;
    if (prefix === "secure") {
      finalKey = "__Secure-" + key;
    } else if (prefix === "host") {
      finalKey = "__Host-" + key;
    }
    const obj2 = parse(cookie, finalKey);
    return obj2[finalKey];
  }
};
var generateCookie = (name, value, opt) => {
  let cookie;
  if (opt?.prefix === "secure") {
    cookie = serialize("__Secure-" + name, value, { path: "/", ...opt, secure: true });
  } else if (opt?.prefix === "host") {
    cookie = serialize("__Host-" + name, value, {
      ...opt,
      path: "/",
      secure: true,
      domain: void 0
    });
  } else {
    cookie = serialize(name, value, { path: "/", ...opt });
  }
  return cookie;
};
var setCookie = (c, name, value, opt) => {
  const cookie = generateCookie(name, value, opt);
  c.header("Set-Cookie", cookie, { append: true });
};
var deleteCookie = (c, name, opt) => {
  const deletedCookie = getCookie(c, name, opt?.prefix);
  setCookie(c, name, "", { ...opt, maxAge: 0 });
  return deletedCookie;
};
var cors = (options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  };
};
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function verifyPassword(password, hash) {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}
function generateToken(user, secret) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1e3
    // 7 días
  };
  const tokenData = JSON.stringify(payload);
  return btoa(tokenData + "." + secret);
}
function verifyToken(token, secret) {
  try {
    const decoded = atob(token);
    const [payloadStr, tokenSecret] = decoded.split("." + secret);
    if (tokenSecret !== "") return null;
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Date.now()) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role
    };
  } catch (error) {
    return null;
  }
}
function authMiddleware() {
  return async (c, next) => {
    let token = c.req.header("Authorization");
    if (token?.startsWith("Bearer ")) {
      token = token.slice(7);
    } else {
      token = getCookie(c, "auth_token");
    }
    if (!token) {
      return c.json({ error: "Token de autenticación requerido" }, 401);
    }
    const user = verifyToken(token, c.env.JWT_SECRET);
    if (!user) {
      return c.json({ error: "Token inválido" }, 401);
    }
    c.set("user", user);
    await next();
  };
}
const app = new Hono2();
const rateLimitStore = /* @__PURE__ */ new Map();
function cleanupRateLimitStore(store) {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}
app.use("*", async (c, next) => {
  if (Math.random() < 0.1) {
    cleanupRateLimitStore(rateLimitStore);
  }
  const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Real-IP") || "unknown";
  const now = Date.now();
  const windowMs = 60 * 1e3;
  const maxRequests = 100;
  const key = `${ip}:${Math.floor(now / windowMs)}`;
  const record = rateLimitStore.get(key);
  if (record) {
    if (record.count >= maxRequests) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`);
      try {
        await c.env.DB.prepare(
          "INSERT INTO rate_limit_log (ip_address, endpoint, attempts, user_agent) VALUES (?, ?, ?, ?)"
        ).bind(ip, c.req.path, record.count, c.req.header("user-agent") || "unknown").run();
      } catch (e) {
        console.error("Error logging rate limit:", e);
      }
      return c.json({
        error: "Demasiadas solicitudes. Por favor, espera un momento e intenta nuevamente."
      }, 429);
    }
    record.count++;
  } else {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
  }
  await next();
});
async function registrarTransaccionSaldo(db, userId, currency, tipo, monto, saldoAnterior, saldoNuevo, descripcion, realizadoPor) {
  try {
    await db.prepare(`
      INSERT INTO saldo_transacciones 
      (user_id, currency, tipo, monto, saldo_anterior, saldo_nuevo, descripcion, realizado_por, fecha_transaccion) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(userId, currency, tipo, monto, saldoAnterior, saldoNuevo, descripcion, realizadoPor).run();
    console.log(`✅ Transacción registrada: Usuario ${userId} - ${tipo} ${monto} ${currency} por ${realizadoPor}`);
  } catch (error) {
    console.error("❌ Error registrando transacción:", error);
  }
}
app.use("*", cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "https://*.pages.dev", "https://*.workers.dev"],
  credentials: true
}));
const loginRateLimitStore = /* @__PURE__ */ new Map();
const loginRateLimit = async (c, next) => {
  const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Real-IP") || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1e3;
  const maxLoginAttempts = 10;
  const key = `login:${ip}:${Math.floor(now / windowMs)}`;
  const record = loginRateLimitStore.get(key);
  if (record) {
    if (record.count >= maxLoginAttempts) {
      console.warn(`🚨 Login rate limit exceeded for IP: ${ip}`);
      try {
        await c.env.DB.prepare(
          "INSERT INTO rate_limit_log (ip_address, endpoint, attempts, user_agent) VALUES (?, ?, ?, ?)"
        ).bind(ip, "/api/auth/login", record.count, c.req.header("user-agent") || "unknown").run();
      } catch (e) {
        console.error("Error logging login rate limit:", e);
      }
      return c.json({
        error: "Demasiados intentos de inicio de sesión. Por favor, espera 15 minutos."
      }, 429);
    }
    record.count++;
  } else {
    loginRateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
  }
  await next();
};
app.post("/api/auth/login", loginRateLimit, async (c) => {
  const body = await c.req.json();
  if (!body.email || !body.password) {
    return c.json({ error: "Email y contraseña son requeridos" }, 400);
  }
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM users WHERE LOWER(email) = LOWER(?)"
  ).bind(body.email).all();
  if (results.length === 0) {
    return c.json({ error: "Credenciales inválidas" }, 401);
  }
  const user = results[0];
  if (user.locked_until) {
    const lockedUntil = new Date(user.locked_until);
    const now = /* @__PURE__ */ new Date();
    if (now < lockedUntil) {
      const minutesLeft = Math.ceil((lockedUntil.getTime() - now.getTime()) / 6e4);
      return c.json({
        error: `Cuenta bloqueada. Intenta nuevamente en ${minutesLeft} minutos.`
      }, 403);
    } else {
      await c.env.DB.prepare(
        "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?"
      ).bind(user.id).run();
    }
  }
  const isValidPassword = await verifyPassword(body.password, user.password_hash);
  if (!isValidPassword) {
    const failedAttempts = (user.failed_login_attempts || 0) + 1;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (failedAttempts >= 3) {
      const lockUntil = new Date(Date.now() + 30 * 60 * 1e3).toISOString();
      await c.env.DB.prepare(
        "UPDATE users SET failed_login_attempts = ?, locked_until = ?, last_failed_login = ? WHERE id = ?"
      ).bind(failedAttempts, lockUntil, now, user.id).run();
      try {
        console.log("🔔 Intentando enviar email de bloqueo...");
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${c.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "Tharsis Expense <onboarding@resend.dev>",
            to: "wrizzo6802@gmail.com",
            subject: "🔒 ALERTA: Cuenta bloqueada por intentos fallidos",
            html: `
              <h2>⚠️ Alerta de Seguridad</h2>
              <p>La cuenta del usuario <strong>${user.name}</strong> (${user.email}) ha sido bloqueada temporalmente.</p>
              <p><strong>Razón:</strong> 3 intentos fallidos de inicio de sesión</p>
              <p><strong>Hora del bloqueo:</strong> ${(/* @__PURE__ */ new Date()).toLocaleString("es-AR")}</p>
              <p><strong>Duración del bloqueo:</strong> 30 minutos</p>
              <p><strong>IP/User Agent:</strong> ${c.req.header("user-agent") || "No disponible"}</p>
              <hr>
              <p style="color: #666; font-size: 12px;">Este es un mensaje automático del sistema ExpenseFlow.</p>
            `
          })
        });
        const emailResult = await emailResponse.json();
        console.log("📧 Respuesta de Resend:", emailResponse.status, emailResult);
      } catch (emailError) {
        console.error("❌ Error sending lock notification email:", emailError);
      }
      return c.json({
        error: "Cuenta bloqueada por múltiples intentos fallidos. Intenta nuevamente en 30 minutos."
      }, 403);
    } else {
      await c.env.DB.prepare(
        "UPDATE users SET failed_login_attempts = ?, last_failed_login = ? WHERE id = ?"
      ).bind(failedAttempts, now, user.id).run();
      return c.json({
        error: `Credenciales inválidas. Intentos restantes: ${3 - failedAttempts}`
      }, 401);
    }
  }
  await c.env.DB.prepare(
    "UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_failed_login = NULL WHERE id = ?"
  ).bind(user.id).run();
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
  const token = generateToken(userData, c.env.JWT_SECRET);
  setCookie(c, "auth_token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 7 * 24 * 60 * 60
    // 7 días
  });
  return c.json({
    success: true,
    user: userData,
    token
  });
});
app.post("/api/auth/register", async (c) => {
  const body = await c.req.json();
  if (!body.email || !body.password || !body.name) {
    return c.json({ error: "Email, contraseña y nombre son requeridos" }, 400);
  }
  const { results: existingUsers } = await c.env.DB.prepare(
    "SELECT id FROM users WHERE LOWER(email) = LOWER(?)"
  ).bind(body.email).all();
  if (existingUsers.length > 0) {
    return c.json({ error: "El usuario ya existe" }, 400);
  }
  const passwordHash = await hashPassword(body.password);
  const userId = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)"
  ).bind(userId, body.email, body.name, passwordHash, "usuario").run();
  await c.env.DB.prepare(
    "INSERT INTO user_profiles (user_id, role, balance) VALUES (?, ?, ?)"
  ).bind(userId, "usuario", 0).run();
  const userData = {
    id: userId,
    email: body.email,
    name: body.name,
    role: "usuario"
  };
  const token = generateToken(userData, c.env.JWT_SECRET);
  setCookie(c, "auth_token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 7 * 24 * 60 * 60
  });
  return c.json({
    success: true,
    user: userData,
    token
  });
});
app.post("/api/auth/logout", async (c) => {
  deleteCookie(c, "auth_token", { path: "/" });
  return c.json({ success: true });
});
app.get("/api/users/me", authMiddleware(), async (c) => {
  const user = c.get("user");
  const { results: userResults } = await c.env.DB.prepare(
    "SELECT id as user_id, name, email, role, created_at, updated_at FROM users WHERE id = ?"
  ).bind(user.id).all();
  if (userResults.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }
  const userData = userResults[0];
  const { results: saldoResults } = await c.env.DB.prepare(
    "SELECT balance FROM saldos WHERE user_id = ? AND currency = ?"
  ).bind(user.id, "ARS").all();
  const balance = saldoResults.length > 0 ? saldoResults[0].balance : 0;
  return c.json({
    user_id: userData.user_id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    balance: balance || 0,
    created_at: userData.created_at,
    updated_at: userData.updated_at
  });
});
app.get("/api/expenses/pending/count", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const { results: userResults } = await c.env.DB.prepare(
      "SELECT role FROM users WHERE id = ?"
    ).bind(user.id).all();
    if (userResults.length === 0 || !["admin", "supervisor"].includes(userResults[0].role)) {
      return c.json({ error: "No autorizado" }, 403);
    }
    const { results } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM expenses WHERE status = 'pendiente'"
    ).all();
    return c.json({ count: results[0].count || 0 });
  } catch (error) {
    console.error("Error contando gastos pendientes:", error);
    return c.json({ error: String(error) }, 500);
  }
});
app.get("/api/expenses", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const { results: userResults } = await c.env.DB.prepare(
      "SELECT role FROM users WHERE id = ?"
    ).bind(user.id).all();
    if (userResults.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }
    const userRole = userResults[0].role;
    let query = "";
    let params = [];
    if (userRole === "admin" || userRole === "supervisor") {
      query = `SELECT e.*, u.name as user_name, u.email as user_email 
               FROM expenses e 
               LEFT JOIN users u ON e.user_id = u.id 
               ORDER BY e.expense_date DESC, e.created_at DESC`;
    } else {
      query = `SELECT e.*, u.name as user_name, u.email as user_email 
               FROM expenses e 
               LEFT JOIN users u ON e.user_id = u.id 
               WHERE e.user_id = ? 
               ORDER BY e.expense_date DESC, e.created_at DESC`;
      params = [user.id];
    }
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    const expensesWithAttachments = await Promise.all(
      results.map(async (expense) => {
        const { results: attachments } = await c.env.DB.prepare(
          "SELECT filename, original_name, content_type FROM expense_attachments WHERE expense_id = ? ORDER BY created_at"
        ).bind(expense.id).all();
        return {
          ...expense,
          attachments: attachments.map((att) => ({
            filename: att.filename,
            originalName: att.original_name,
            contentType: att.content_type,
            url: `/api/files/${att.filename}`
          }))
        };
      })
    );
    return c.json(expensesWithAttachments);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.post("/api/expenses", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const expense = await c.req.json();
    console.log("Creating expense for user:", user.id, "Data:", expense);
    let descuentaSaldo = 1;
    if (expense.tipo_comprobante_id) {
      const { results: comprobanteResults } = await c.env.DB.prepare(
        "SELECT descuenta_saldo FROM tipo_comprobantes WHERE id = ?"
      ).bind(expense.tipo_comprobante_id).all();
      if (comprobanteResults.length > 0) {
        descuentaSaldo = Number(comprobanteResults[0].descuenta_saldo ?? 1);
      }
    }
    if (expense.use_balance && descuentaSaldo !== 0) {
      const expenseAmount = parseFloat(expense.amount);
      const currency = expense.currency || "ARS";
      const { results: saldoAnteriorResults } = await c.env.DB.prepare(
        "SELECT balance FROM saldos WHERE user_id = ? AND currency = ?"
      ).bind(user.id, currency).all();
      let saldoAnterior = 0;
      if (saldoAnteriorResults.length === 0) {
        await c.env.DB.prepare(`
          INSERT INTO saldos (user_id, currency, balance, created_at, updated_at) 
          VALUES (?, ?, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(user.id, currency).run();
      } else {
        saldoAnterior = Number(saldoAnteriorResults[0].balance) || 0;
      }
      const { success } = await c.env.DB.prepare(
        "UPDATE saldos SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND currency = ?"
      ).bind(expenseAmount, user.id, currency).run();
      if (!success) {
        return c.json({ error: "Error al actualizar saldo" }, 500);
      }
      const saldoNuevo = saldoAnterior - expenseAmount;
      await registrarTransaccionSaldo(
        c.env.DB,
        user.id,
        currency,
        "descuento",
        expenseAmount,
        saldoAnterior,
        saldoNuevo,
        `Descuento por gasto: ${expense.description}`,
        user.email || "USUARIO"
      );
      console.log(`✅ Saldo ${currency} descontado: $${expenseAmount} del usuario ${user.id} (${saldoAnterior} → ${saldoNuevo})`);
    }
    const { results } = await c.env.DB.prepare(
      "INSERT INTO expenses (user_id, category, description, amount, expense_date, status, currency, use_balance, tipo_comprobante_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *"
    ).bind(
      user.id,
      // usar el usuario autenticado
      expense.category,
      expense.description,
      expense.amount,
      expense.expense_date,
      "pendiente",
      expense.currency || "ARS",
      expense.use_balance && descuentaSaldo !== 0 ? 1 : 0,
      expense.tipo_comprobante_id || null
    ).all();
    console.log("Expense created:", results[0]);
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.put("/api/expenses/:id", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const expenseId = c.req.param("id");
    const expenseData = await c.req.json();
    const { results: currentExpense } = await c.env.DB.prepare(
      "SELECT status, user_id FROM expenses WHERE id = ?"
    ).bind(expenseId).all();
    if (currentExpense.length === 0) {
      return c.json({ error: "Gasto no encontrado" }, 404);
    }
    if (currentExpense[0].user_id !== user.id) {
      return c.json({ error: "No tienes permiso para editar este gasto" }, 403);
    }
    if (currentExpense[0].status !== "pendiente") {
      return c.json({
        error: "No se puede editar un gasto que ya ha sido aprobado o rechazado"
      }, 400);
    }
    const { results } = await c.env.DB.prepare(
      "UPDATE expenses SET category = ?, description = ?, amount = ?, expense_date = ?, currency = ?, tipo_comprobante_id = ? WHERE id = ? RETURNING *"
    ).bind(
      expenseData.category,
      expenseData.description,
      expenseData.amount,
      expenseData.expense_date,
      expenseData.currency || "ARS",
      expenseData.tipo_comprobante_id || null,
      expenseId
    ).all();
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.put("/api/expenses/:id/approve", async (c) => {
  try {
    const expenseId = c.req.param("id");
    const { results } = await c.env.DB.prepare(
      "UPDATE expenses SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *"
    ).bind("aprobado", "supervisor", expenseId).all();
    if (results.length === 0) {
      return c.json({ error: "Gasto no encontrado" }, 404);
    }
    return c.json({ success: true, expense: results[0] });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.put("/api/expenses/:id/reject", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const expenseId = c.req.param("id");
    const { rejectionReason } = await c.req.json();
    if (user.role !== "supervisor" && user.role !== "admin") {
      return c.json({ error: "No tienes permisos para rechazar gastos" }, 403);
    }
    if (!rejectionReason || rejectionReason.trim() === "") {
      return c.json({ error: "Debes proporcionar una razón para el rechazo" }, 400);
    }
    const { results: expenseDetails } = await c.env.DB.prepare(
      "SELECT * FROM expenses WHERE id = ?"
    ).bind(expenseId).all();
    if (expenseDetails.length === 0) {
      return c.json({ error: "Gasto no encontrado" }, 404);
    }
    const expense = expenseDetails[0];
    if (expense.use_balance) {
      const reembolsoAmount = Number(expense.amount) || 0;
      const currency = expense.currency || "ARS";
      const { results: saldoAnteriorResults } = await c.env.DB.prepare(
        "SELECT balance FROM saldos WHERE user_id = ? AND currency = ?"
      ).bind(expense.user_id, currency).all();
      const saldoAnterior = saldoAnteriorResults.length > 0 ? Number(saldoAnteriorResults[0].balance) || 0 : 0;
      await c.env.DB.prepare(
        "UPDATE users SET balance = balance + ? WHERE id = ?"
      ).bind(reembolsoAmount, expense.user_id).run();
      await c.env.DB.prepare(
        "UPDATE user_profiles SET balance = balance + ? WHERE user_id = ?"
      ).bind(reembolsoAmount, expense.user_id).run();
      await c.env.DB.prepare(`
        INSERT OR REPLACE INTO saldos (user_id, currency, balance, created_at, updated_at) 
        VALUES (?, ?, COALESCE((SELECT balance FROM saldos WHERE user_id = ? AND currency = ?), 0) + ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(expense.user_id, currency, expense.user_id, currency, reembolsoAmount).run();
      const saldoNuevo = saldoAnterior + reembolsoAmount;
      await registrarTransaccionSaldo(
        c.env.DB,
        expense.user_id,
        currency,
        "carga",
        reembolsoAmount,
        saldoAnterior,
        saldoNuevo,
        `Reembolso por rechazo de gasto: ${expense.description}`,
        user.email || "USUARIO"
      );
      console.log(`✅ Saldo reembolsado por rechazo: $${reembolsoAmount} ${currency} al usuario ${expense.user_id} (${saldoAnterior} → ${saldoNuevo})`);
    }
    const { results } = await c.env.DB.prepare(
      `UPDATE expenses 
       SET status = ?, 
           approved_by = ?, 
           approved_at = CURRENT_TIMESTAMP,
           rejection_reason = ?,
           rejected_by = ?,
           rejected_at = CURRENT_TIMESTAMP
       WHERE id = ? 
       RETURNING *`
    ).bind("rechazado", user.email, rejectionReason, user.name, expenseId).all();
    if (results.length === 0) {
      return c.json({ error: "Gasto no encontrado" }, 404);
    }
    console.log(`✅ Gasto ${expenseId} rechazado por ${user.name}. Razón: ${rejectionReason}`);
    return c.json({ success: true, expense: results[0], refunded: expense.use_balance ? expense.amount : 0 });
  } catch (error) {
    console.error("Error al rechazar gasto:", error);
    return c.json({ error: String(error) }, 500);
  }
});
app.delete("/api/expenses/:id", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const expenseId = c.req.param("id");
    const { results: currentExpense } = await c.env.DB.prepare(
      "SELECT status, user_id FROM expenses WHERE id = ?"
    ).bind(expenseId).all();
    if (currentExpense.length === 0) {
      return c.json({ error: "Gasto no encontrado" }, 404);
    }
    if (currentExpense[0].user_id !== user.id) {
      return c.json({ error: "No tienes permiso para eliminar este gasto" }, 403);
    }
    if (currentExpense[0].status !== "pendiente") {
      return c.json({
        error: "No se puede eliminar un gasto que ya ha sido aprobado o rechazado"
      }, 400);
    }
    const { results: expenseDetails } = await c.env.DB.prepare(
      "SELECT * FROM expenses WHERE id = ?"
    ).bind(expenseId).all();
    const expense = expenseDetails[0];
    if (expense.use_balance) {
      const reembolsoAmount = Number(expense.amount) || 0;
      const currency = expense.currency || "ARS";
      const { results: saldoAnteriorResults } = await c.env.DB.prepare(
        "SELECT balance FROM saldos WHERE user_id = ? AND currency = ?"
      ).bind(expense.user_id, currency).all();
      const saldoAnterior = saldoAnteriorResults.length > 0 ? Number(saldoAnteriorResults[0].balance) || 0 : 0;
      await c.env.DB.prepare(
        "UPDATE users SET balance = balance + ? WHERE id = ?"
      ).bind(reembolsoAmount, expense.user_id).run();
      await c.env.DB.prepare(
        "UPDATE user_profiles SET balance = balance + ? WHERE user_id = ?"
      ).bind(reembolsoAmount, expense.user_id).run();
      await c.env.DB.prepare(`
        INSERT OR REPLACE INTO saldos (user_id, currency, balance, created_at, updated_at) 
        VALUES (?, ?, COALESCE((SELECT balance FROM saldos WHERE user_id = ? AND currency = ?), 0) + ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(expense.user_id, currency, expense.user_id, currency, reembolsoAmount).run();
      const saldoNuevo = saldoAnterior + reembolsoAmount;
      await registrarTransaccionSaldo(
        c.env.DB,
        expense.user_id,
        currency,
        "carga",
        reembolsoAmount,
        saldoAnterior,
        saldoNuevo,
        `Reembolso por eliminación de gasto: ${expense.description}`,
        user.email || "USUARIO"
      );
      console.log(`✅ Saldo reembolsado por eliminación: $${reembolsoAmount} ${currency} al usuario ${expense.user_id} (${saldoAnterior} → ${saldoNuevo})`);
    }
    const { results } = await c.env.DB.prepare(
      "DELETE FROM expenses WHERE id = ? RETURNING *"
    ).bind(expenseId).all();
    if (results.length === 0) {
      return c.json({ error: "Expense not found" }, 404);
    }
    return c.json({
      success: true,
      deleted: results[0],
      refunded: expense.use_balance ? expense.amount : 0
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.put("/api/expenses/:id/status", authMiddleware(), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const { results: profiles } = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  ).bind(user.id).all();
  const userProfile = profiles[0];
  if (!userProfile || !["admin", "supervisor"].includes(userProfile.role)) {
    return c.json({ error: "No tienes permisos para aprobar gastos" }, 403);
  }
  const { results: expenses } = await c.env.DB.prepare(
    "SELECT * FROM expenses WHERE id = ?"
  ).bind(id).all();
  if (expenses.length === 0) {
    return c.json({ error: "Gasto no encontrado" }, 404);
  }
  const expense = expenses[0];
  if (body.status === "rechazado" && expense.use_balance) {
    const reembolsoAmount = Number(expense.amount) || 0;
    const currency = expense.currency || "ARS";
    const { results: saldoAnteriorResults } = await c.env.DB.prepare(
      "SELECT balance FROM saldos WHERE user_id = ? AND currency = ?"
    ).bind(expense.user_id, currency).all();
    const saldoAnterior = saldoAnteriorResults.length > 0 ? Number(saldoAnteriorResults[0].balance) || 0 : 0;
    await c.env.DB.prepare(
      "UPDATE users SET balance = balance + ? WHERE id = ?"
    ).bind(reembolsoAmount, expense.user_id).run();
    await c.env.DB.prepare(
      "UPDATE user_profiles SET balance = balance + ? WHERE user_id = ?"
    ).bind(reembolsoAmount, expense.user_id).run();
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO saldos (user_id, currency, balance, created_at, updated_at) 
      VALUES (?, ?, COALESCE((SELECT balance FROM saldos WHERE user_id = ? AND currency = ?), 0) + ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(expense.user_id, currency, expense.user_id, currency, reembolsoAmount).run();
    const saldoNuevo = saldoAnterior + reembolsoAmount;
    await registrarTransaccionSaldo(
      c.env.DB,
      expense.user_id,
      currency,
      "carga",
      reembolsoAmount,
      saldoAnterior,
      saldoNuevo,
      `Reembolso por rechazo de gasto: ${expense.description}`,
      user.email || "ADMIN"
    );
    console.log(`✅ Saldo reembolsado: $${reembolsoAmount} ${currency} al usuario ${expense.user_id} por rechazo de gasto (${saldoAnterior} → ${saldoNuevo})`);
  }
  await c.env.DB.prepare(
    "UPDATE expenses SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(body.status, user.id, id).run();
  return c.json({ success: true });
});
app.post("/api/users/:userId/balance", authMiddleware(), async (c) => {
  const user = c.get("user");
  const userId = c.req.param("userId");
  const body = await c.req.json();
  const { results: profiles } = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  ).bind(user.id).all();
  const userProfile = profiles[0];
  if (!userProfile || !["admin", "supervisor"].includes(userProfile.role)) {
    return c.json({ error: "No tienes permisos para cargar saldo" }, 403);
  }
  await c.env.DB.prepare(
    "UPDATE user_profiles SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?"
  ).bind(body.amount, userId).run();
  await c.env.DB.prepare(
    "UPDATE users SET balance = balance + ? WHERE id = ?"
  ).bind(body.amount, userId).run();
  await c.env.DB.prepare(
    "INSERT INTO balance_transactions (user_id, amount, type, description, created_by) VALUES (?, ?, ?, ?, ?)"
  ).bind(userId, body.amount, "carga", body.description || "Carga de saldo", user.id).run();
  return c.json({ success: true });
});
app.get("/api/users", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT 
        users.id as user_id, 
        users.name, 
        users.email, 
        users.role, 
        COALESCE(saldos.balance, 0) as balance,
        50000 as monthly_salary,
        users.created_at, 
        users.updated_at 
       FROM users 
       LEFT JOIN saldos ON users.id = saldos.user_id AND saldos.currency = 'ARS'
       WHERE users.email IS NOT NULL
       ORDER BY users.created_at DESC`
    ).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.post("/api/users", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const { results: userResults } = await c.env.DB.prepare(
      "SELECT role FROM users WHERE id = ?"
    ).bind(user.id).all();
    if (userResults.length === 0 || !["admin", "supervisor"].includes(userResults[0].role)) {
      return c.json({ error: "No tienes permisos para crear usuarios" }, 403);
    }
    const body = await c.req.json();
    const { name, email, role, balance, monthly_salary, password } = body;
    console.log("Received body:", JSON.stringify(body));
    console.log("Name:", name, "Email:", email);
    if (!name || !email || String(name).trim() === "" || String(email).trim() === "") {
      console.log("Validation failed:", { name, email, nameValid: !!name, emailValid: !!email });
      return c.json({ error: "Nombre y email son requeridos" }, 400);
    }
    const userPassword = password || "password123";
    const hashedPassword = await hashPassword(userPassword);
    const userId = "user_" + Date.now();
    await c.env.DB.prepare(
      "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
    ).bind(
      userId,
      String(name),
      String(email),
      hashedPassword,
      role || "employee"
    ).run();
    const balanceValue = Number(balance) || 0;
    await c.env.DB.prepare(
      "INSERT INTO user_profiles (user_id, role, balance) VALUES (?, ?, ?)"
    ).bind(userId, role || "employee", balanceValue).run();
    const monthlySalaryValue = Number(monthly_salary) || 5e4;
    const { results } = await c.env.DB.prepare(
      `SELECT 
        users.id as user_id, 
        users.name, 
        users.email, 
        users.role, 
        COALESCE(user_profiles.balance, 0) as balance,
        ? as monthly_salary,
        users.created_at, 
        users.updated_at 
       FROM users 
       LEFT JOIN user_profiles ON users.id = user_profiles.user_id 
       WHERE users.id = ?`
    ).bind(monthlySalaryValue, userId).all();
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.get("/api/users/:userId/balance/:currency", async (c) => {
  try {
    const userId = c.req.param("userId");
    const currency = c.req.param("currency");
    const { results } = await c.env.DB.prepare(
      "SELECT balance FROM saldos WHERE user_id = ? AND currency = ?"
    ).bind(userId, currency).all();
    const balance = results.length > 0 ? Number(results[0].balance) || 0 : 0;
    return c.json({ balance, currency });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return c.json({ balance: 0, currency: c.req.param("currency") }, 200);
  }
});
app.put("/api/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();
    const { name, email, role, balance, monthly_salary, currency } = body;
    console.log("🔥 PUT /api/users/:userId - Inicio:", { userId, name, email, role, balance, currency });
    if (!name || !email || String(name).trim() === "" || String(email).trim() === "") {
      console.error("❌ Missing required fields:", { name, email });
      return c.json({ error: "Nombre y email son requeridos" }, 400);
    }
    await c.env.DB.prepare(
      "UPDATE users SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(String(name), String(email), role || "employee", userId).run();
    console.log("✅ Usuario actualizado en tabla users");
    const montoCarga = Number(balance) || 0;
    if (montoCarga !== 0) {
      const currencyCode = currency || "ARS";
      const { results: existingBalance } = await c.env.DB.prepare(
        "SELECT id, balance FROM saldos WHERE user_id = ? AND currency = ?"
      ).bind(userId, currencyCode).all();
      const saldoAnterior = existingBalance.length > 0 ? Number(existingBalance[0].balance) || 0 : 0;
      const saldoNuevo = saldoAnterior + montoCarga;
      console.log("💰 Balance update:", {
        currencyCode,
        saldoAnterior,
        montoCarga,
        saldoNuevo,
        existingRecord: existingBalance.length > 0
      });
      if (existingBalance.length > 0) {
        await c.env.DB.prepare(
          "UPDATE saldos SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND currency = ?"
        ).bind(saldoNuevo, userId, currencyCode).run();
        console.log("✅ Balance UPDATED en tabla saldos");
      } else {
        await c.env.DB.prepare(
          "INSERT INTO saldos (user_id, currency, balance, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        ).bind(userId, currencyCode, saldoNuevo).run();
        console.log("✅ Balance INSERTED en tabla saldos");
      }
      const tipoTransaccion = montoCarga > 0 ? "carga" : "descuento";
      const descripcion = montoCarga > 0 ? `Carga de saldo: +${Math.abs(montoCarga)} ${currencyCode}` : `Descuento de saldo: ${montoCarga} ${currencyCode}`;
      await registrarTransaccionSaldo(
        c.env.DB,
        userId,
        currencyCode,
        tipoTransaccion,
        Math.abs(montoCarga),
        saldoAnterior,
        saldoNuevo,
        descripcion,
        "admin"
      );
      console.log("✅ Transacción registrada");
    }
    const monthlySalaryValue = Number(monthly_salary) || 5e4;
    const { results: arsBalance } = await c.env.DB.prepare(
      "SELECT balance FROM saldos WHERE user_id = ? AND currency = ?"
    ).bind(userId, "ARS").all();
    const balanceARS = arsBalance.length > 0 ? Number(arsBalance[0].balance) || 0 : 0;
    const { results } = await c.env.DB.prepare(
      "SELECT id as user_id, name, email, role, created_at, updated_at FROM users WHERE id = ?"
    ).bind(userId).all();
    const userResponse = {
      ...results[0],
      balance: balanceARS,
      monthly_salary: monthlySalaryValue
    };
    console.log("✅ PUT /api/users/:userId - Usuario retornado:", userResponse);
    return c.json(userResponse);
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return c.json({ error: String(error) }, 500);
  }
});
app.delete("/api/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    await c.env.DB.prepare("DELETE FROM user_profiles WHERE user_id = ?").bind(userId).run();
    const { results } = await c.env.DB.prepare(
      "DELETE FROM users WHERE id = ? RETURNING *"
    ).bind(userId).all();
    if (results.length === 0) {
      return c.json({ error: "Usuario no encontrado" }, 404);
    }
    return c.json({ success: true, deleted: results[0] });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.put("/api/users/:userId/profile", authMiddleware(), async (c) => {
  const user = c.get("user");
  const userId = c.req.param("userId");
  const body = await c.req.json();
  const { results: profiles } = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  ).bind(user.id).all();
  const userProfile = profiles[0];
  if (!userProfile || !["admin", "supervisor"].includes(userProfile.role)) {
    return c.json({ error: "No tienes permisos para modificar usuarios" }, 403);
  }
  await c.env.DB.prepare(
    "UPDATE user_profiles SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?"
  ).bind(body.role, userId).run();
  return c.json({ success: true });
});
app.get("/api/balance/movements", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const { results: userResults } = await c.env.DB.prepare(
      "SELECT role FROM users WHERE id = ?"
    ).bind(user.id).all();
    if (userResults.length === 0 || !["admin", "supervisor"].includes(userResults[0].role)) {
      return c.json({ error: "No tienes permisos para ver el historial" }, 403);
    }
    const { results } = await c.env.DB.prepare(`
      SELECT 
        st.id,
        st.user_id,
        u.name as user_name,
        st.currency,
        st.tipo as type,
        st.monto as amount,
        st.saldo_anterior as balance_before,
        st.saldo_nuevo as balance_after,
        st.descripcion as description,
        st.realizado_por as created_by,
        st.fecha_transaccion as created_at
      FROM saldo_transacciones st
      LEFT JOIN users u ON st.user_id = u.id
      ORDER BY st.fecha_transaccion DESC
      LIMIT 100
    `).all();
    return c.json({
      success: true,
      movements: results
    });
  } catch (error) {
    console.error("Error obteniendo movimientos:", error);
    return c.json({ error: String(error) }, 500);
  }
});
app.get("/api/expenses/reports/summary", async (c) => {
  try {
    const { results: byCategory } = await c.env.DB.prepare(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM expenses 
       GROUP BY category
       ORDER BY total DESC`
    ).all();
    const { results: byMonth } = await c.env.DB.prepare(
      `SELECT 
         strftime('%Y-%m', expense_date) as month,
         SUM(amount) as total,
         COUNT(*) as count
       FROM expenses 
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`
    ).all();
    const { results: totals } = await c.env.DB.prepare(
      `SELECT 
         SUM(amount) as total_amount,
         COUNT(*) as total_count
       FROM expenses`
    ).all();
    return c.json({
      byCategory,
      byMonth,
      totals: totals[0] || { total_amount: 0, total_count: 0 }
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.post("/api/expenses/:id/receipt", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const expenseId = c.req.param("id");
    const { results: expenseResults } = await c.env.DB.prepare(
      "SELECT user_id FROM expenses WHERE id = ?"
    ).bind(expenseId).all();
    if (expenseResults.length === 0) {
      return c.json({ error: "Gasto no encontrado" }, 404);
    }
    const expense = expenseResults[0];
    if (expense.user_id !== user.id) {
      return c.json({ error: "No tienes permisos para subir archivos a este gasto" }, 403);
    }
    const formData = await c.req.formData();
    const file = formData.get("receipt");
    if (!file) {
      return c.json({ error: "No se encontró el archivo" }, 400);
    }
    if (!file.type.startsWith("image/")) {
      return c.json({ error: "Solo se permiten imágenes" }, 400);
    }
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: "Archivo demasiado grande (máximo 5MB)" }, 400);
    }
    console.log(`Converting file to base64: ${file.name}, type: ${file.type}, size: ${file.size}`);
    let base64;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binaryString = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        binaryString += String.fromCharCode(...chunk);
      }
      base64 = btoa(binaryString);
      console.log(`✅ Base64 conversion successful for ${file.type}: ${base64.length} chars`);
    } catch (error) {
      console.error("❌ Base64 conversion failed:", error);
      try {
        const text = await file.text();
        base64 = btoa(text);
        console.log("🔄 Alternative method successful, length:", base64.length);
      } catch (error2) {
        console.error("❌ All methods failed, creating minimal placeholder:", error2);
        base64 = btoa(`CORRUPTED_FILE_${file.name}_${file.type}`);
      }
    }
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `receipt_${expenseId}_${timestamp}.${extension}`;
    try {
      await c.env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS file_storage (
          filename TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          content_type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } catch (e) {
    }
    console.log(`Saving file: ${filename}, size: ${file.size}, type: ${file.type}, base64 length: ${base64.length}`);
    try {
      await c.env.DB.prepare(
        "INSERT OR REPLACE INTO file_storage (filename, data, content_type) VALUES (?, ?, ?)"
      ).bind(filename, base64, file.type).run();
      console.log("File saved successfully to database");
    } catch (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Error guardando en la base de datos");
    }
    await c.env.DB.prepare(
      "UPDATE expenses SET receipt_photo_url = ? WHERE id = ?"
    ).bind(filename, expenseId).run();
    const fileUrl = `/api/files/${filename}`;
    return c.json({
      success: true,
      filename,
      fileUrl,
      message: "Comprobante subido exitosamente"
    });
  } catch (error) {
    console.error("Error uploading receipt:", error);
    return c.json({ error: "Error al subir el comprobante" }, 500);
  }
});
app.get("/api/files/:filename", async (c) => {
  try {
    const filename = c.req.param("filename");
    console.log(`Looking for file: ${filename}`);
    const { results } = await c.env.DB.prepare(
      "SELECT data, content_type FROM file_storage WHERE filename = ?"
    ).bind(filename).all();
    console.log(`Found ${results.length} results for ${filename}`);
    if (results.length === 0) {
      const svg = `
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">
            Archivo no encontrado
          </text>
          <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">
            ${filename}
          </text>
        </svg>
      `;
      return c.body(svg, 404, {
        "Content-Type": "image/svg+xml"
      });
    }
    const fileData = results[0];
    try {
      console.log(`📤 Serving file: ${filename}, type: ${fileData.content_type}`);
      const binaryString = atob(fileData.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const headers = {
        "Content-Type": fileData.content_type || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
        "Content-Length": bytes.length.toString(),
        "Accept-Ranges": "bytes"
      };
      console.log(`✅ File served successfully: ${bytes.length} bytes`);
      return c.body(bytes, 200, headers);
    } catch (decodeError) {
      console.error("❌ Error decoding base64 for file:", filename, decodeError);
      const errorSvg = `
        <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#fee2e2"/>
          <text x="50%" y="30%" text-anchor="middle" font-family="Arial" font-size="14" fill="#dc2626">
            Error al cargar imagen
          </text>
          <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="10" fill="#7f1d1d">
            Formato: ${fileData.content_type}
          </text>
          <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="8" fill="#991b1b">
            ${filename}
          </text>
        </svg>
      `;
      return c.body(errorSvg, 200, {
        "Content-Type": "image/svg+xml"
      });
    }
  } catch (error) {
    console.error("Error serving file:", error);
    return c.json({ error: "Error al servir el archivo" }, 500);
  }
});
app.get("/api/debug/files", authMiddleware(), async (c) => {
  const user = c.get("user");
  if (user.role !== "admin") {
    return c.json({ error: "Solo administradores" }, 403);
  }
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        f.filename, 
        f.content_type, 
        f.created_at,
        LENGTH(f.data) as size_bytes,
        e.id as expense_id,
        e.description as expense_description
      FROM file_storage f 
      LEFT JOIN expenses e ON e.receipt_photo_url = f.filename 
      ORDER BY f.created_at DESC 
      LIMIT 20
    `).all();
    return c.json({
      success: true,
      files: results,
      total: results.length
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.get("/api/users/me/balances", authMiddleware(), async (c) => {
  const user = c.get("user");
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT currency, balance FROM saldos WHERE user_id = ? AND balance != 0 ORDER BY currency"
    ).bind(user.id).all();
    console.log(`💰 Saldos multimoneda consultados para usuario ${user.id}:`, results);
    return c.json({
      success: true,
      balances: results.map((row) => ({
        currency: row.currency,
        balance: Number(row.balance) || 0
      })),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("❌ Error consultando saldos multimoneda:", error);
    return c.json({
      success: false,
      balances: [],
      error: "Error al obtener balances"
    }, 500);
  }
});
app.get("/api/debug/balance/:userId/:currency", async (c) => {
  const userId = c.req.param("userId");
  const currency = c.req.param("currency");
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM saldos WHERE user_id = ? AND currency = ?"
    ).bind(userId, currency).all();
    return c.json({
      userId,
      currency,
      results,
      count: results.length
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.get("/api/debug/test-auth-balance/:currency", authMiddleware(), async (c) => {
  const user = c.get("user");
  const currency = c.req.param("currency");
  console.log("🧪 TEST - user object:", JSON.stringify(user));
  console.log("🧪 TEST - user.id:", user.id);
  console.log("🧪 TEST - currency:", currency);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM saldos WHERE user_id = ? AND currency = ?"
  ).bind(user.id, currency).all();
  console.log("🧪 TEST - query results:", JSON.stringify(results));
  return c.json({
    user_from_token: user,
    currency,
    query_results: results,
    balance: results.length > 0 ? results[0].balance : 0
  });
});
app.get("/api/users/me/balance/:currency", authMiddleware(), async (c) => {
  const user = c.get("user");
  const currency = c.req.param("currency");
  try {
    console.log(`🔍 FULL USER OBJECT:`, JSON.stringify(user));
    console.log(`🔍 user.id type:`, typeof user.id);
    console.log(`🔍 Consultando saldo: user_id=${user.id}, currency=${currency}`);
    const { results } = await c.env.DB.prepare(
      "SELECT balance FROM saldos WHERE user_id = ? AND currency = ?"
    ).bind(user.id, currency).all();
    console.log(`🔍 Query results:`, JSON.stringify(results));
    const balance = results.length > 0 ? Number(results[0].balance) || 0 : 0;
    console.log(`💰 Saldo consultado para usuario ${user.id} en ${currency}: ${balance}`);
    return c.json({
      success: true,
      balance,
      currency,
      user_id_debug: user.id,
      // DEBUG
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("❌ Error consultando saldo:", error);
    return c.json({
      success: false,
      balance: 0,
      currency,
      error: "Error al obtener balance"
    });
  }
});
app.post("/api/users/change-password", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const { currentPassword, newPassword } = await c.req.json();
    if (!currentPassword || !newPassword) {
      return c.json({ error: "Contraseña actual y nueva son requeridas" }, 400);
    }
    if (newPassword.length < 6) {
      return c.json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }, 400);
    }
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind(user.email).all();
    if (results.length === 0) {
      return c.json({ error: "Usuario no encontrado" }, 404);
    }
    const userData = results[0];
    const isValidCurrentPassword = await verifyPassword(currentPassword, userData.password_hash);
    if (!isValidCurrentPassword) {
      return c.json({ error: "Contraseña actual incorrecta" }, 400);
    }
    const newPasswordHash = await hashPassword(newPassword);
    const { results: updateResults } = await c.env.DB.prepare(
      "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ? RETURNING email"
    ).bind(newPasswordHash, user.email).all();
    if (updateResults.length === 0) {
      return c.json({ error: "Error al actualizar contraseña" }, 500);
    }
    return c.json({ success: true, message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error changing password:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});
app.post("/api/users/:userId/change-password", authMiddleware(), async (c) => {
  try {
    const currentUser = c.get("user");
    const userId = c.req.param("userId");
    const { newPassword } = await c.req.json();
    const { results: currentUserResults } = await c.env.DB.prepare(
      "SELECT role FROM users WHERE id = ?"
    ).bind(currentUser.id).all();
    if (currentUserResults.length === 0 || !["admin", "supervisor"].includes(currentUserResults[0].role)) {
      return c.json({ error: "No tienes permisos para cambiar contraseñas de otros usuarios" }, 403);
    }
    if (!newPassword) {
      return c.json({ error: "Nueva contraseña es requerida" }, 400);
    }
    if (newPassword.length < 6) {
      return c.json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }, 400);
    }
    const { results: targetUserResults } = await c.env.DB.prepare(
      "SELECT id, name, email FROM users WHERE id = ?"
    ).bind(userId).all();
    if (targetUserResults.length === 0) {
      return c.json({ error: "Usuario no encontrado" }, 404);
    }
    const newPasswordHash = await hashPassword(newPassword);
    await c.env.DB.prepare(
      "UPDATE users SET password_hash = ?, failed_login_attempts = 0, locked_until = NULL, last_failed_login = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(newPasswordHash, userId).run();
    console.log(`✅ Admin/Supervisor ${currentUser.email} cambió contraseña de usuario ${targetUserResults[0].email} y desbloqueó la cuenta`);
    return c.json({
      success: true,
      message: `Contraseña de ${targetUserResults[0].name} actualizada exitosamente`
    });
  } catch (error) {
    console.error("Error changing user password:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});
app.get("/api/categories", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM categories ORDER BY name"
    ).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.post("/api/categories", async (c) => {
  try {
    const { name, description, color, icon } = await c.req.json();
    const { results } = await c.env.DB.prepare(
      "INSERT INTO categories (name, description, color, icon) VALUES (?, ?, ?, ?) RETURNING *"
    ).bind(name, description, color || "#6B7280", icon || "🏷️").all();
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.put("/api/categories/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { name, description, color, icon } = await c.req.json();
    const { results } = await c.env.DB.prepare(
      "UPDATE categories SET name = ?, description = ?, color = ?, icon = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *"
    ).bind(name, description, color, icon, id).all();
    if (results.length === 0) {
      return c.json({ error: "Categoría no encontrada" }, 404);
    }
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.delete("/api/categories/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { results } = await c.env.DB.prepare(
      "DELETE FROM categories WHERE id = ? RETURNING *"
    ).bind(id).all();
    if (results.length === 0) {
      return c.json({ error: "Categoría no encontrada" }, 404);
    }
    return c.json({ success: true, deleted: results[0] });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.get("/api/tipo-comprobantes", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM tipo_comprobantes ORDER BY nombre"
    ).all();
    return c.json(results);
  } catch (error) {
    console.error("Error fetching tipo_comprobantes:", error);
    return c.json({ error: String(error) }, 500);
  }
});
app.post("/api/tipo-comprobantes", async (c) => {
  try {
    const { nombre, descripcion, codigo, activo, descuenta_saldo } = await c.req.json();
    const { results } = await c.env.DB.prepare(
      "INSERT INTO tipo_comprobantes (nombre, descripcion, codigo, activo, descuenta_saldo) VALUES (?, ?, ?, ?, ?) RETURNING *"
    ).bind(nombre, descripcion || null, codigo || null, activo !== false ? 1 : 0, descuenta_saldo ?? 1).all();
    return c.json(results[0]);
  } catch (error) {
    console.error("Error creating tipo_comprobante:", error);
    return c.json({ error: String(error) }, 500);
  }
});
app.put("/api/tipo-comprobantes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { nombre, descripcion, codigo, activo, descuenta_saldo } = await c.req.json();
    const { results } = await c.env.DB.prepare(
      "UPDATE tipo_comprobantes SET nombre = ?, descripcion = ?, codigo = ?, activo = ?, descuenta_saldo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *"
    ).bind(nombre, descripcion, codigo, activo !== false ? 1 : 0, descuenta_saldo ?? 1, id).all();
    if (results.length === 0) {
      return c.json({ error: "Tipo de comprobante no encontrado" }, 404);
    }
    return c.json(results[0]);
  } catch (error) {
    console.error("Error updating tipo_comprobante:", error);
    return c.json({ error: String(error) }, 500);
  }
});
app.delete("/api/tipo-comprobantes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { results } = await c.env.DB.prepare(
      "DELETE FROM tipo_comprobantes WHERE id = ? RETURNING *"
    ).bind(id).all();
    if (results.length === 0) {
      return c.json({ error: "Tipo de comprobante no encontrado" }, 404);
    }
    return c.json({ success: true, deleted: results[0] });
  } catch (error) {
    console.error("Error deleting tipo_comprobante:", error);
    return c.json({ error: String(error) }, 500);
  }
});
app.get("/api/currencies", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM currencies WHERE is_active = 1 ORDER BY code"
    ).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.post("/api/currencies", authMiddleware(), async (c) => {
  try {
    const { code, name, symbol } = await c.req.json();
    if (!code || !name || !symbol) {
      return c.json({ error: "Código, nombre y símbolo son requeridos" }, 400);
    }
    const { results } = await c.env.DB.prepare(
      "INSERT INTO currencies (code, name, symbol, is_active) VALUES (?, ?, ?, 1) RETURNING *"
    ).bind(code.toUpperCase(), name, symbol).all();
    return c.json(results[0]);
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return c.json({ error: "El código de moneda ya existe" }, 400);
    }
    return c.json({ error: String(error) }, 500);
  }
});
app.put("/api/currencies/:id", authMiddleware(), async (c) => {
  try {
    const id = c.req.param("id");
    const { code, name, symbol, is_active } = await c.req.json();
    const { results } = await c.env.DB.prepare(
      "UPDATE currencies SET code = ?, name = ?, symbol = ?, is_active = ? WHERE id = ? RETURNING *"
    ).bind(code?.toUpperCase(), name, symbol, is_active ?? 1, id).all();
    if (results.length === 0) {
      return c.json({ error: "Moneda no encontrada" }, 404);
    }
    return c.json(results[0]);
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return c.json({ error: "El código de moneda ya existe" }, 400);
    }
    return c.json({ error: String(error) }, 500);
  }
});
app.delete("/api/currencies/:id", authMiddleware(), async (c) => {
  try {
    const id = c.req.param("id");
    const { results: expensesCheck } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM expenses WHERE currency = (SELECT code FROM currencies WHERE id = ?)"
    ).bind(id).all();
    if (expensesCheck[0]?.count > 0) {
      return c.json({ error: "No se puede eliminar: la moneda está siendo usada en gastos" }, 400);
    }
    const { results } = await c.env.DB.prepare(
      "DELETE FROM currencies WHERE id = ? RETURNING *"
    ).bind(id).all();
    if (results.length === 0) {
      return c.json({ error: "Moneda no encontrada" }, 404);
    }
    return c.json({ success: true, deleted: results[0] });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.get("/api/tipo-comprobantes", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM tipo_comprobantes WHERE activo = 1 ORDER BY nombre"
    ).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.post("/api/tipo-comprobantes", authMiddleware(), async (c) => {
  try {
    const body = await c.req.json();
    const { nombre, codigo, descripcion } = body;
    if (!nombre || !codigo) {
      return c.json({ error: "Nombre y código son requeridos" }, 400);
    }
    const { results } = await c.env.DB.prepare(
      "INSERT INTO tipo_comprobantes (nombre, codigo, descripcion) VALUES (?, ?, ?) RETURNING *"
    ).bind(nombre, codigo, descripcion || null).all();
    return c.json(results[0], 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.put("/api/tipo-comprobantes/:id", authMiddleware(), async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { nombre, codigo, descripcion, activo } = body;
    const { results } = await c.env.DB.prepare(
      "UPDATE tipo_comprobantes SET nombre = ?, codigo = ?, descripcion = ?, activo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *"
    ).bind(nombre, codigo, descripcion || null, activo ?? 1, id).all();
    if (results.length === 0) {
      return c.json({ error: "Tipo de comprobante no encontrado" }, 404);
    }
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.delete("/api/tipo-comprobantes/:id", authMiddleware(), async (c) => {
  try {
    const id = c.req.param("id");
    const { results: expensesCheck } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM expenses WHERE tipo_comprobante_id = ?"
    ).bind(id).all();
    if (expensesCheck[0]?.count > 0) {
      return c.json({ error: "No se puede eliminar: el tipo de comprobante está siendo usado en gastos" }, 400);
    }
    const { results } = await c.env.DB.prepare(
      "DELETE FROM tipo_comprobantes WHERE id = ? RETURNING *"
    ).bind(id).all();
    if (results.length === 0) {
      return c.json({ error: "Tipo de comprobante no encontrado" }, 404);
    }
    return c.json({ success: true, deleted: results[0] });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.post("/api/test-expense", async (c) => {
  const body = await c.req.json();
  try {
    await c.env.DB.prepare(
      "INSERT INTO expenses (user_id, description, amount, category, expense_date, status, use_balance) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind("admin-001", body.description, body.amount, body.category, (/* @__PURE__ */ new Date()).toISOString().split("T")[0], "pendiente", 0).run();
    return c.json({
      success: true,
      message: "Gasto de prueba creado"
    });
  } catch (error) {
    return c.json({
      error: String(error)
    }, 500);
  }
});
app.post("/api/ocr/extract-amount", authMiddleware(), async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("receipt");
    if (!file) {
      return c.json({ error: "No se encontró el archivo" }, 400);
    }
    console.log("Processing file:", file.name, "Size:", file.size, "Type:", file.type);
    const arrayBuffer = await file.arrayBuffer();
    let extractedText = "";
    let amount = 0;
    let isRealOCR = false;
    try {
      console.log("🔍 Trying REAL OCR with Google Vision API...");
      const realOCRResult = await performGoogleVisionOCR(arrayBuffer, file.type);
      if (realOCRResult && realOCRResult.text) {
        extractedText = realOCRResult.text;
        amount = extractAmountFromText(extractedText) || 0;
        isRealOCR = true;
        console.log("✅ REAL OCR successful! Found amount:", amount);
      }
    } catch (error) {
      console.log("❌ Real OCR failed, using manual input mode:", error);
    }
    if (!isRealOCR || amount === 0) {
      console.log("📝 OCR failed, switching to manual input mode");
      return c.json({
        amount: null,
        extractedText: "OCR no disponible - Por favor ingresa el monto manualmente",
        success: true,
        manual: true,
        message: "No se pudo leer automáticamente. Ingresa el monto del ticket."
      });
    }
    console.log("Final extracted text:", extractedText);
    console.log("Final found amount:", amount);
    if (amount && amount > 0) {
      return c.json({
        amount,
        extractedText,
        success: true
      });
    } else {
      const randomAmount = generateRandomAmount();
      return c.json({
        amount: randomAmount,
        extractedText: `Texto simulado - Total: $${randomAmount}`,
        success: true,
        simulated: true
      });
    }
  } catch (error) {
    console.error("OCR Error:", error);
    return c.json({ error: "Error al procesar la imagen: " + String(error) }, 500);
  }
});
async function performGoogleVisionOCR(_arrayBuffer, _contentType) {
  console.log("� OCR temporarily disabled - manual input mode");
  return null;
}
function generateRandomAmount() {
  const ranges = [
    { min: 50, max: 300 },
    // Comidas
    { min: 500, max: 2e3 },
    // Compras
    { min: 2e3, max: 8e3 },
    // Combustible
    { min: 100, max: 1500 }
    // Varios
  ];
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  return Math.floor(Math.random() * (range.max - range.min) + range.min);
}
function extractAmountFromText(text) {
  console.log("Extracting amount from text:", text);
  const patterns = [
    // Patrones de ALTA PRIORIDAD para formato mexicano ($180.00)
    /TOTAL[:\s]*\$?\s*([\d,]+\.?\d{0,2})/i,
    /Total[:\s]*\$?\s*([\d,]+\.?\d{0,2})/i,
    /Pagó\s+en\s+efectivo[:\s]*\$?\s*([\d,]+\.?\d{0,2})/i,
    /\$\s*([\d,]+\.?\d{0,2})\s*$/m,
    // Final de línea con $
    // Patrones de alta prioridad - formato europeo con coma decimal
    /TOTAL[:\s]*€?\s*([\d]+,\d{2})/i,
    /Total[:\s]*€?\s*([\d]+,\d{2})/i,
    /Total[:\s]*\s*([\d]+,\d{2})/i,
    /IMPORTE[:\s]*TOTAL[:\s]*€?\s*([\d]+,\d{2})/i,
    /Total[:\s]*a[:\s]*pagar[:\s]*€?\s*([\d]+,\d{2})/i,
    // Patrones de alta prioridad - formato americano con punto decimal
    /TOTAL[:\s]*\$?\s*([\d,]+\.\d{2})/i,
    /Total[:\s]*\$?\s*([\d,]+\.\d{2})/i,
    /IMPORTE[:\s]*TOTAL[:\s]*\$?\s*([\d,]+\.\d{2})/i,
    /Total[:\s]*a[:\s]*pagar[:\s]*\$?\s*([\d,]+\.\d{2})/i,
    // Patrones para detectar "Euros" en línea separada (recibo L'ESPIGA DOR)
    /Euros[:\s]*€?\s*([\d]+,\d{2})/i,
    /€[:\s]*€?\s*([\d]+,\d{2})/i,
    // Patrones de mediana prioridad
    /Importe[:\s]*€?\s*([\d]+,\d{2})/i,
    /Neto[:\s]*€?\s*([\d]+,\d{2})/i,
    /Pago\s+con\s+tarjeta[:\s]*€?\s*([\d]+,\d{2})/i,
    // Patrones generales con formato europeo
    /€\s*([\d]+,\d{2})/g,
    /([\d]+,\d{2})\s*€/g,
    // Patrones generales con formato americano (fallback)
    /\$\s*([\d,]+\.\d{2})/g,
    /([\d,]+\.\d{2})\s*\$/g
  ];
  let foundAmounts = [];
  patterns.forEach((pattern, index) => {
    let matches;
    if (pattern.global) {
      while ((matches = pattern.exec(text)) !== null) {
        let amount = parseAmountString(matches[1]);
        if (amount && amount > 0.01 && amount < 5e5) {
          foundAmounts.push({ amount, priority: index });
        }
      }
      pattern.lastIndex = 0;
    } else {
      matches = text.match(pattern);
      if (matches && matches[1]) {
        let amount = parseAmountString(matches[1]);
        if (amount && amount > 0.01 && amount < 5e5) {
          foundAmounts.push({ amount, priority: index });
        }
      }
    }
  });
  function parseAmountString(amountStr) {
    if (!amountStr) return null;
    if (amountStr.includes(",") && !amountStr.includes(".")) {
      const europeanAmount = parseFloat(amountStr.replace(",", "."));
      if (!isNaN(europeanAmount)) {
        console.log(`Parsed European format ${amountStr} -> ${europeanAmount}`);
        return europeanAmount;
      }
    }
    if (amountStr.includes(".")) {
      const americanAmount = parseFloat(amountStr.replace(/,/g, ""));
      if (!isNaN(americanAmount)) {
        console.log(`Parsed American format ${amountStr} -> ${americanAmount}`);
        return americanAmount;
      }
    }
    const intAmount = parseInt(amountStr.replace(/[^\d]/g, ""));
    if (!isNaN(intAmount)) {
      console.log(`Parsed integer format ${amountStr} -> ${intAmount}`);
      return intAmount;
    }
    return null;
  }
  console.log("Found amounts with priority:", foundAmounts);
  if (foundAmounts.length > 0) {
    foundAmounts.sort((a, b) => a.priority - b.priority);
    const highestPriority = foundAmounts[0].priority;
    const highestPriorityAmounts = foundAmounts.filter((a) => a.priority === highestPriority);
    return Math.max(...highestPriorityAmounts.map((a) => a.amount));
  }
  return null;
}
app.post("/api/dba/execute", authMiddleware(), async (c) => {
  const user = c.get("user");
  if (user.role !== "admin") {
    return c.json({ error: "Acceso denegado. Solo administradores." }, 403);
  }
  try {
    const body = await c.req.json();
    const { query } = body;
    if (!query || typeof query !== "string") {
      return c.json({ error: "Query SQL es requerido" }, 400);
    }
    const sqlQuery = query.trim();
    const extremelyDangerousPatterns = [
      /DROP\s+DATABASE/i,
      /DROP\s+SCHEMA/i,
      /PRAGMA\s+/i
      // Evitar cambios de configuración de SQLite
    ];
    for (const pattern of extremelyDangerousPatterns) {
      if (pattern.test(sqlQuery)) {
        return c.json({
          error: "Operación extremadamente peligrosa bloqueada. Contacte al administrador del sistema."
        }, 400);
      }
    }
    console.log(`DBA Query ejecutado por ${user.email}: ${sqlQuery}`);
    let result;
    const isSelectQuery = /^\s*SELECT/i.test(sqlQuery);
    if (isSelectQuery) {
      result = await c.env.DB.prepare(sqlQuery).all();
      return c.json({
        success: true,
        results: result.results || [],
        count: result.results?.length || 0,
        message: `Query ejecutado exitosamente. ${result.results?.length || 0} filas retornadas.`
      });
    } else {
      result = await c.env.DB.prepare(sqlQuery).run();
      return c.json({
        success: true,
        results: [],
        changes: result.meta?.changes || 0,
        message: `Query ejecutado exitosamente. ${result.meta?.changes || 0} filas afectadas.`
      });
    }
  } catch (error) {
    console.error("Error ejecutando query DBA:", error);
    return c.json({
      error: `Error SQL: ${error.message || "Error desconocido"}`
    }, 500);
  }
});
app.post("/api/expenses/:id/attachments", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const expenseId = c.req.param("id");
    const { results: expenseResults } = await c.env.DB.prepare(
      "SELECT * FROM expenses WHERE id = ? AND user_id = ?"
    ).bind(expenseId, user.id).all();
    if (expenseResults.length === 0) {
      return c.json({ error: "Gasto no encontrado o no autorizado" }, 404);
    }
    const formData = await c.req.formData();
    const files = formData.getAll("files");
    if (!files || files.length === 0) {
      return c.json({ error: "No se encontraron archivos para subir" }, 400);
    }
    const uploadedFiles = [];
    for (const file of files) {
      if (!(file instanceof File)) continue;
      if (!file.type.startsWith("image/")) {
        console.log(`❌ Archivo rechazado - tipo inválido: ${file.type}`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        console.log(`❌ Archivo rechazado - muy grande: ${file.size} bytes`);
        continue;
      }
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split(".").pop() || "jpg";
      const filename = `expense_${expenseId}_${timestamp}_${randomString}.${extension}`;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
        const base64Data = btoa(binaryString);
        await c.env.DB.prepare(
          'INSERT INTO file_storage (filename, data, content_type, created_at) VALUES (?, ?, ?, datetime("now"))'
        ).bind(filename, base64Data, file.type).run();
        await c.env.DB.prepare(
          "INSERT INTO expense_attachments (expense_id, filename, original_name, content_type, file_size) VALUES (?, ?, ?, ?, ?)"
        ).bind(expenseId, filename, file.name, file.type, file.size).run();
        uploadedFiles.push({
          filename,
          originalName: file.name,
          contentType: file.type,
          size: file.size,
          url: `/api/files/${filename}`
        });
        console.log(`✅ Archivo subido exitosamente: ${filename} (${file.size} bytes)`);
      } catch (error) {
        console.error(`❌ Error subiendo archivo ${file.name}:`, error);
      }
    }
    return c.json({
      success: true,
      uploadedFiles,
      message: `Se subieron ${uploadedFiles.length} de ${files.length} archivos`
    });
  } catch (error) {
    console.error("Error uploading attachments:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});
app.get("/api/expenses/:id/attachments", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const expenseId = c.req.param("id");
    const { results: expenseResults } = await c.env.DB.prepare(
      'SELECT * FROM expenses WHERE id = ? AND (user_id = ? OR ? IN (SELECT id FROM users WHERE role IN ("admin", "supervisor")))'
    ).bind(expenseId, user.id, user.id).all();
    if (expenseResults.length === 0) {
      return c.json({ error: "Gasto no encontrado o no autorizado" }, 404);
    }
    const { results: attachments } = await c.env.DB.prepare(
      "SELECT id, filename, original_name, content_type, file_size, created_at FROM expense_attachments WHERE expense_id = ? ORDER BY created_at"
    ).bind(expenseId).all();
    const formattedAttachments = attachments.map((att) => ({
      id: att.id,
      filename: att.filename,
      originalName: att.original_name,
      contentType: att.content_type,
      size: att.file_size,
      createdAt: att.created_at,
      url: `/api/files/${att.filename}`
    }));
    return c.json({
      success: true,
      attachments: formattedAttachments
    });
  } catch (error) {
    console.error("Error getting attachments:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});
app.delete("/api/expenses/:expenseId/attachments/:attachmentId", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const expenseId = c.req.param("expenseId");
    const attachmentId = c.req.param("attachmentId");
    const { results: expenseResults } = await c.env.DB.prepare(
      "SELECT * FROM expenses WHERE id = ? AND user_id = ?"
    ).bind(expenseId, user.id).all();
    if (expenseResults.length === 0) {
      return c.json({ error: "Gasto no encontrado o no autorizado" }, 404);
    }
    const { results: attachmentResults } = await c.env.DB.prepare(
      "SELECT filename FROM expense_attachments WHERE id = ? AND expense_id = ?"
    ).bind(attachmentId, expenseId).all();
    if (attachmentResults.length === 0) {
      return c.json({ error: "Archivo adjunto no encontrado" }, 404);
    }
    const attachment = attachmentResults[0];
    await c.env.DB.prepare(
      "DELETE FROM expense_attachments WHERE id = ? AND expense_id = ?"
    ).bind(attachmentId, expenseId).run();
    await c.env.DB.prepare(
      "DELETE FROM file_storage WHERE filename = ?"
    ).bind(attachment.filename).run();
    return c.json({
      success: true,
      message: "Archivo eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});
app.get("/api/transacciones-saldo", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    let query = `
      SELECT 
        st.id,
        st.user_id,
        u.name as user_name,
        u.email as user_email,
        st.currency,
        st.tipo,
        st.monto,
        st.saldo_anterior,
        st.saldo_nuevo,
        st.descripcion,
        st.realizado_por,
        st.fecha_transaccion,
        st.created_at
      FROM saldo_transacciones st
      LEFT JOIN users u ON st.user_id = u.id
    `;
    const params = [];
    if (user.role !== "admin") {
      query += " WHERE st.user_id = ?";
      params.push(user.id);
    }
    query += " ORDER BY st.fecha_transaccion DESC LIMIT 50";
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({
      transacciones: results,
      total: results.length
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return c.json({ error: String(error) }, 500);
  }
});
app.get("/api/users/:userId/transacciones-saldo", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const userId = c.req.param("userId");
    if (user.role !== "admin") {
      return c.json({ error: "Solo administradores pueden consultar transacciones de otros usuarios" }, 403);
    }
    const { results } = await c.env.DB.prepare(`
      SELECT 
        st.id,
        st.user_id,
        u.name as user_name,
        u.email as user_email,
        st.currency,
        st.tipo,
        st.monto,
        st.saldo_anterior,
        st.saldo_nuevo,
        st.descripcion,
        st.realizado_por,
        st.fecha_transaccion,
        st.created_at
      FROM saldo_transacciones st
      LEFT JOIN users u ON st.user_id = u.id
      WHERE st.user_id = ?
      ORDER BY st.fecha_transaccion DESC
    `).bind(userId).all();
    return c.json({
      transacciones: results,
      total: results.length,
      user_id: userId
    });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return c.json({ error: String(error) }, 500);
  }
});
app.get("/api/users/:userId/saldos", authMiddleware(), async (c) => {
  try {
    const user = c.get("user");
    const userId = c.req.param("userId");
    console.log(`🔍 CONSULTA SALDOS: Usuario ${user.id} consultando saldos de ${userId}`);
    if (user.role !== "admin" && user.id !== userId) {
      console.log(`❌ PERMISO DENEGADO: Usuario ${user.id} no puede consultar saldos de ${userId}`);
      return c.json({ error: "Solo administradores pueden consultar saldos de otros usuarios" }, 403);
    }
    const { results } = await c.env.DB.prepare(`
      SELECT currency, balance 
      FROM saldos 
      WHERE user_id = ? 
      ORDER BY currency
    `).bind(userId).all();
    console.log(`💰 Saldos consultados para usuario ${userId}:`, results);
    return c.json({
      success: true,
      user_id: userId,
      saldos: results
    });
  } catch (error) {
    console.error("Error fetching user balances:", error);
    return c.json({ error: String(error) }, 500);
  }
});
app.get("*", async (c) => {
  const url = new URL(c.req.url);
  let response = await c.env.ASSETS.fetch(url);
  if (response.status === 404 && !url.pathname.startsWith("/assets/")) {
    const indexUrl = new URL(c.req.url);
    indexUrl.pathname = "/index.html";
    response = await c.env.ASSETS.fetch(indexUrl);
  }
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  newResponse.headers.set("Pragma", "no-cache");
  newResponse.headers.set("Expires", "0");
  return newResponse;
});
const workerEntry = app ?? {};
export {
  workerEntry as default
};
