import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);import bannerUrl from 'url';const __dirname = bannerUrl.fileURLToPath(new URL('.', import.meta.url));

// node_modules/.pnpm/@opennextjs+cloudflare@1.14.1_wrangler@4.51.0/node_modules/@opennextjs/cloudflare/dist/api/cloudflare-context.js
var cloudflareContextSymbol = Symbol.for("__cloudflare-context__");
function getCloudflareContext(options = { async: false }) {
  return options.async ? getCloudflareContextAsync() : getCloudflareContextSync();
}
function getCloudflareContextFromGlobalScope() {
  const global = globalThis;
  return global[cloudflareContextSymbol];
}
function inSSG() {
  const global = globalThis;
  return global.__NEXT_DATA__?.nextExport === true;
}
function getCloudflareContextSync() {
  const cloudflareContext = getCloudflareContextFromGlobalScope();
  if (cloudflareContext) {
    return cloudflareContext;
  }
  if (inSSG()) {
    throw new Error(`

ERROR: \`getCloudflareContext\` has been called in sync mode in either a static route or at the top level of a non-static one, both cases are not allowed but can be solved by either:
  - make sure that the call is not at the top level and that the route is not static
  - call \`getCloudflareContext({async: true})\` to use the \`async\` mode
  - avoid calling \`getCloudflareContext\` in the route
`);
  }
  throw new Error(initOpenNextCloudflareForDevErrorMsg);
}
async function getCloudflareContextAsync() {
  const cloudflareContext = getCloudflareContextFromGlobalScope();
  if (cloudflareContext) {
    return cloudflareContext;
  }
  const inNodejsRuntime = process.env.NEXT_RUNTIME === "nodejs";
  if (inNodejsRuntime || inSSG()) {
    const cloudflareContext2 = await getCloudflareContextFromWrangler();
    addCloudflareContextToNodejsGlobal(cloudflareContext2);
    return cloudflareContext2;
  }
  throw new Error(initOpenNextCloudflareForDevErrorMsg);
}
function addCloudflareContextToNodejsGlobal(cloudflareContext) {
  const global = globalThis;
  global[cloudflareContextSymbol] = cloudflareContext;
}
async function getCloudflareContextFromWrangler(options) {
  const { getPlatformProxy } = await import(
    /* webpackIgnore: true */
    `${"__wrangler".replaceAll("_", "")}`
  );
  const environment = options?.environment ?? process.env.NEXT_DEV_WRANGLER_ENV;
  const { env, cf, ctx } = await getPlatformProxy({
    ...options,
    // The `env` passed to the fetch handler does not contain variables from `.env*` files.
    // because we invoke wrangler with `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV`=`"false"`.
    // Initializing `envFiles` with an empty list is the equivalent for this API call.
    envFiles: [],
    environment
  });
  return {
    env,
    cf,
    ctx
  };
}
var initOpenNextCloudflareForDevErrorMsg = `

ERROR: \`getCloudflareContext\` has been called without having called \`initOpenNextCloudflareForDev\` from the Next.js config file.
You should update your Next.js config file as shown below:

   \`\`\`
   // next.config.mjs

   import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

   initOpenNextCloudflareForDev();

   const nextConfig = { ... };
   export default nextConfig;
   \`\`\`

`;

// node_modules/.pnpm/@opennextjs+cloudflare@1.14.1_wrangler@4.51.0/node_modules/@opennextjs/cloudflare/dist/api/overrides/asset-resolver/index.js
var resolver = {
  name: "cloudflare-asset-resolver",
  async maybeGetAssetResult(event) {
    const { ASSETS } = getCloudflareContext().env;
    if (!ASSETS || !isUserWorkerFirst(globalThis.__ASSETS_RUN_WORKER_FIRST__, event.rawPath)) {
      return void 0;
    }
    const { method, headers } = event;
    if (method !== "GET" && method != "HEAD") {
      return void 0;
    }
    const url = new URL(event.rawPath, "https://assets.local");
    const response = await ASSETS.fetch(url, {
      headers,
      method
    });
    if (response.status === 404) {
      await response.body?.cancel();
      return void 0;
    }
    return {
      type: "core",
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      // Workers and Node types differ.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: response.body || new ReadableStream(),
      isBase64Encoded: false
    };
  }
};
function isUserWorkerFirst(runWorkerFirst, pathname) {
  if (!Array.isArray(runWorkerFirst)) {
    return runWorkerFirst ?? false;
  }
  let hasPositiveMatch = false;
  for (let rule of runWorkerFirst) {
    let isPositiveRule = true;
    if (rule.startsWith("!")) {
      rule = rule.slice(1);
      isPositiveRule = false;
    } else if (hasPositiveMatch) {
      continue;
    }
    const match = new RegExp(`^${rule.replace(/([[\]().*+?^$|{}\\])/g, "\\$1").replace("\\*", ".*")}$`).test(pathname);
    if (match) {
      if (isPositiveRule) {
        hasPositiveMatch = true;
      } else {
        return false;
      }
    }
  }
  return hasPositiveMatch;
}
var asset_resolver_default = resolver;

// node_modules/.pnpm/@opennextjs+cloudflare@1.14.1_wrangler@4.51.0/node_modules/@opennextjs/cloudflare/dist/api/config.js
function defineCloudflareConfig(config = {}) {
  const { incrementalCache, tagCache, queue, cachePurge, enableCacheInterception = false, routePreloadingBehavior = "none" } = config;
  return {
    default: {
      override: {
        wrapper: "cloudflare-node",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: resolveIncrementalCache(incrementalCache),
        tagCache: resolveTagCache(tagCache),
        queue: resolveQueue(queue),
        cdnInvalidation: resolveCdnInvalidation(cachePurge)
      },
      routePreloadingBehavior
    },
    // node:crypto is used to compute cache keys
    edgeExternals: ["node:crypto"],
    cloudflare: {
      useWorkerdCondition: true
    },
    dangerous: {
      enableCacheInterception
    },
    middleware: {
      external: true,
      override: {
        wrapper: "cloudflare-edge",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: resolveIncrementalCache(incrementalCache),
        tagCache: resolveTagCache(tagCache),
        queue: resolveQueue(queue)
      },
      assetResolver: () => asset_resolver_default
    }
  };
}
function resolveIncrementalCache(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveTagCache(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveQueue(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveCdnInvalidation(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}

// node_modules/.pnpm/@opennextjs+aws@3.9.1/node_modules/@opennextjs/aws/dist/utils/error.js
var IgnorableError = class extends Error {
  __openNextInternal = true;
  canIgnore = true;
  logLevel = 0;
  constructor(message) {
    super(message);
    this.name = "IgnorableError";
  }
};
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}

// node_modules/.pnpm/@opennextjs+aws@3.9.1/node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
var DOWNPLAYED_ERROR_LOGS = [
  {
    clientName: "S3Client",
    commandName: "GetObjectCommand",
    errorName: "NoSuchKey"
  }
];
var isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}

// node_modules/.pnpm/@opennextjs+cloudflare@1.14.1_wrangler@4.51.0/node_modules/@opennextjs/cloudflare/dist/api/overrides/internal.js
import { createHash } from "node:crypto";
var debugCache = (name, ...args) => {
  if (process.env.NEXT_PRIVATE_DEBUG_CACHE) {
    console.log(`[${name}] `, ...args);
  }
};
var FALLBACK_BUILD_ID = "no-build-id";
var DEFAULT_PREFIX = "incremental-cache";
function computeCacheKey(key, options) {
  const { cacheType = "cache", prefix = DEFAULT_PREFIX, buildId = FALLBACK_BUILD_ID } = options;
  const hash = createHash("sha256").update(key).digest("hex");
  return `${prefix}/${buildId}/${hash}.${cacheType}`.replace(/\/+/g, "/");
}
function isPurgeCacheEnabled() {
  const cdnInvalidation = globalThis.openNextConfig?.default?.override?.cdnInvalidation;
  return cdnInvalidation !== void 0 && cdnInvalidation !== "dummy";
}
async function purgeCacheByTags(tags) {
  const { env } = getCloudflareContext();
  if (env.NEXT_CACHE_DO_PURGE) {
    const durableObject = env.NEXT_CACHE_DO_PURGE;
    const id = durableObject.idFromName("cache-purge");
    const obj = durableObject.get(id);
    await obj.purgeCacheByTags(tags);
  } else {
    await internalPurgeCacheByTags(env, tags);
  }
}
async function internalPurgeCacheByTags(env, tags) {
  if (!env.CACHE_PURGE_ZONE_ID || !env.CACHE_PURGE_API_TOKEN) {
    error("No cache zone ID or API token provided. Skipping cache purge.");
    return "missing-credentials";
  }
  let response;
  try {
    response = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CACHE_PURGE_ZONE_ID}/purge_cache`, {
      headers: {
        Authorization: `Bearer ${env.CACHE_PURGE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        tags
      })
    });
    if (response.status === 429) {
      error("purgeCacheByTags: Rate limit exceeded. Skipping cache purge.");
      return "rate-limit-exceeded";
    }
    const bodyResponse = await response.json();
    if (!bodyResponse.success) {
      error("purgeCacheByTags: Cache purge failed. Errors:", bodyResponse.errors.map((error2) => `${error2.code}: ${error2.message}`));
      return "purge-failed";
    }
    debugCache("purgeCacheByTags", "Cache purged successfully for tags:", tags);
    return "purge-success";
  } catch (error2) {
    console.error("Error purging cache by tags:", error2);
    return "purge-failed";
  } finally {
    try {
      await response?.body?.cancel();
    } catch {
    }
  }
}

// node_modules/.pnpm/@opennextjs+cloudflare@1.14.1_wrangler@4.51.0/node_modules/@opennextjs/cloudflare/dist/api/overrides/incremental-cache/r2-incremental-cache.js
var NAME = "cf-r2-incremental-cache";
var BINDING_NAME = "NEXT_INC_CACHE_R2_BUCKET";
var PREFIX_ENV_NAME = "NEXT_INC_CACHE_R2_PREFIX";
var R2IncrementalCache = class {
  name = NAME;
  async get(key, cacheType) {
    const r2 = getCloudflareContext().env[BINDING_NAME];
    if (!r2)
      throw new IgnorableError("No R2 bucket");
    debugCache("R2IncrementalCache", `get ${key}`);
    try {
      const r2Object = await r2.get(this.getR2Key(key, cacheType));
      if (!r2Object)
        return null;
      return {
        value: await r2Object.json(),
        lastModified: r2Object.uploaded.getTime()
      };
    } catch (e) {
      error("Failed to get from cache", e);
      return null;
    }
  }
  async set(key, value, cacheType) {
    const r2 = getCloudflareContext().env[BINDING_NAME];
    if (!r2)
      throw new IgnorableError("No R2 bucket");
    debugCache("R2IncrementalCache", `set ${key}`);
    try {
      await r2.put(this.getR2Key(key, cacheType), JSON.stringify(value));
    } catch (e) {
      error("Failed to set to cache", e);
    }
  }
  async delete(key) {
    const r2 = getCloudflareContext().env[BINDING_NAME];
    if (!r2)
      throw new IgnorableError("No R2 bucket");
    debugCache("R2IncrementalCache", `delete ${key}`);
    try {
      await r2.delete(this.getR2Key(key));
    } catch (e) {
      error("Failed to delete from cache", e);
    }
  }
  getR2Key(key, cacheType) {
    return computeCacheKey(key, {
      prefix: getCloudflareContext().env[PREFIX_ENV_NAME],
      buildId: process.env.NEXT_BUILD_ID,
      cacheType
    });
  }
};
var r2_incremental_cache_default = new R2IncrementalCache();

// node_modules/.pnpm/@opennextjs+cloudflare@1.14.1_wrangler@4.51.0/node_modules/@opennextjs/cloudflare/dist/api/overrides/queue/do-queue.js
var do_queue_default = {
  name: "durable-queue",
  send: async (msg) => {
    const durableObject = getCloudflareContext().env.NEXT_CACHE_DO_QUEUE;
    if (!durableObject)
      throw new IgnorableError("No durable object binding for cache revalidation");
    const id = durableObject.idFromName(msg.MessageGroupId);
    const stub = durableObject.get(id);
    await stub.revalidate({
      ...msg
    });
  }
};

// node_modules/.pnpm/@opennextjs+cloudflare@1.14.1_wrangler@4.51.0/node_modules/@opennextjs/cloudflare/dist/api/overrides/tag-cache/d1-next-tag-cache.js
var NAME2 = "d1-next-mode-tag-cache";
var BINDING_NAME2 = "NEXT_TAG_CACHE_D1";
var D1NextModeTagCache = class {
  mode = "nextMode";
  name = NAME2;
  async getLastRevalidated(tags) {
    const { isDisabled, db } = this.getConfig();
    if (isDisabled || tags.length === 0) {
      return 0;
    }
    try {
      const result = await db.prepare(`SELECT MAX(revalidatedAt) AS time FROM revalidations WHERE tag IN (${tags.map(() => "?").join(", ")})`).bind(...tags.map((tag) => this.getCacheKey(tag))).run();
      const timeMs = result.results[0]?.time ?? 0;
      debugCache("D1NextModeTagCache", `getLastRevalidated tags=${tags} -> ${timeMs}`);
      return timeMs;
    } catch (e) {
      error(e);
      return 0;
    }
  }
  async hasBeenRevalidated(tags, lastModified) {
    const { isDisabled, db } = this.getConfig();
    if (isDisabled || tags.length === 0) {
      return false;
    }
    try {
      const result = await db.prepare(`SELECT 1 FROM revalidations WHERE tag IN (${tags.map(() => "?").join(", ")}) AND revalidatedAt > ? LIMIT 1`).bind(...tags.map((tag) => this.getCacheKey(tag)), lastModified ?? Date.now()).raw();
      const revalidated = result.length > 0;
      debugCache("D1NextModeTagCache", `hasBeenRevalidated tags=${tags} at=${lastModified} -> ${revalidated}`);
      return revalidated;
    } catch (e) {
      error(e);
      return false;
    }
  }
  async writeTags(tags) {
    const { isDisabled, db } = this.getConfig();
    if (isDisabled || tags.length === 0)
      return Promise.resolve();
    const nowMs = Date.now();
    await db.batch(tags.map((tag) => db.prepare(`INSERT INTO revalidations (tag, revalidatedAt) VALUES (?, ?)`).bind(this.getCacheKey(tag), nowMs)));
    debugCache("D1NextModeTagCache", `writeTags tags=${tags} time=${nowMs}`);
    if (isPurgeCacheEnabled()) {
      await purgeCacheByTags(tags);
    }
  }
  getConfig() {
    const db = getCloudflareContext().env[BINDING_NAME2];
    if (!db)
      debugCache("No D1 database found");
    const isDisabled = Boolean(globalThis.openNextConfig.dangerous?.disableTagCache);
    return !db || isDisabled ? { isDisabled: true } : {
      isDisabled: false,
      db
    };
  }
  getCacheKey(key) {
    return `${this.getBuildId()}/${key}`.replaceAll("//", "/");
  }
  getBuildId() {
    return process.env.NEXT_BUILD_ID ?? FALLBACK_BUILD_ID;
  }
};
var d1_next_tag_cache_default = new D1NextModeTagCache();

// open-next.config.ts
var open_next_config_default = defineCloudflareConfig({
  incrementalCache: r2_incremental_cache_default,
  queue: do_queue_default,
  // This is only required if you use On-demand revalidation
  tagCache: d1_next_tag_cache_default,
  //If you don't use `revalidatePath`, you can also filter internal soft tags using the `softTagFilter`
  // tagCache: withFilter({
  //   tagCache: d1NextTagCache,
  //   filterFn: softTagFilter,
  // }),
  // Disable this if you want to use PPR
  enableCacheInterception: true
});
export {
  open_next_config_default as default
};
