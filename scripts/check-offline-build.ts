import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = process.cwd();
const distDir = join(root, "dist");
const swPath = join(distDir, "sw.js");
const indexPath = join(distDir, "index.html");

const swSource = readFileSync(swPath, "utf8");
readFileSync(indexPath, "utf8");

const distSources = listFiles(distDir)
  .filter((file) => /\.(html|js)$/.test(file))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

if (!/serviceWorker.*register\(["']\/sw\.js["']\)/s.test(distSources)) {
  throw new Error("Built app does not register /sw.js.");
}

const precacheUrls = extractPrecacheUrls(swSource);
const hashedAssets = precacheUrls.filter((url) => /^\/assets\/.+-[A-Za-z0-9_-]+\.(?:js|css)$/.test(url));
if (hashedAssets.length < 2) {
  throw new Error("Service worker precache does not include Vite hashed JS and CSS assets.");
}

for (const url of precacheUrls.filter((url) => url !== "/")) {
  const filePath = join(distDir, url.replace(/^\//, ""));
  statSync(filePath);
}

await simulateInstallAndOfflineNavigation(swSource, precacheUrls);

console.log(`Offline build gate passed with ${precacheUrls.length} precached URLs and ${hashedAssets.length} hashed assets.`);

function extractPrecacheUrls(source: string): string[] {
  const match = source.match(/const PRECACHE_URLS = (\[[\s\S]*?\]);/);
  if (!match) throw new Error("Could not find PRECACHE_URLS in dist/sw.js.");
  const urls = JSON.parse(match[1]) as string[];
  if (!urls.includes("/") || !urls.includes("/index.html")) {
    throw new Error("Service worker precache must include / and /index.html.");
  }
  return urls;
}

function listFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stat = statSync(path);
    return stat.isDirectory() ? listFiles(path) : [path];
  });
}

async function simulateInstallAndOfflineNavigation(source: string, expectedUrls: string[]) {
  const listeners = new Map<string, (event: ExtendableEventLike | FetchEventLike) => void>();
  const cacheStore = new Map<string, Map<string, string>>();
  const selfMock = {
    location: { origin: "https://local.test" },
    skipWaiting: () => undefined,
    clients: { claim: () => Promise.resolve() },
    addEventListener: (type: string, listener: (event: ExtendableEventLike | FetchEventLike) => void) => {
      listeners.set(type, listener);
    }
  };

  const cachesMock = {
    open: async (name: string) => {
      const cache = cacheStore.get(name) ?? new Map<string, string>();
      cacheStore.set(name, cache);
      return {
        addAll: async (urls: string[]) => {
          for (const url of urls) cache.set(url, `cached:${url}`);
        },
        put: async (request: RequestLike, response: string) => {
          cache.set(request.url, response);
        }
      };
    },
    keys: async () => Array.from(cacheStore.keys()),
    delete: async (name: string) => cacheStore.delete(name),
    match: async (request: RequestLike | string) => {
      const key = typeof request === "string" ? request : new URL(request.url).pathname;
      for (const cache of cacheStore.values()) {
        if (cache.has(key)) return cache.get(key);
      }
      return undefined;
    }
  };

  const context = vm.createContext({
    self: selfMock,
    caches: cachesMock,
    URL,
    fetch: () => Promise.reject(new Error("offline")),
    Promise
  });
  vm.runInContext(source, context);

  const install = listeners.get("install");
  if (!install) throw new Error("Service worker does not register an install listener.");
  const installEvent = makeExtendableEvent();
  install(installEvent);
  await Promise.all(installEvent.promises);

  const cachedCount = Array.from(cacheStore.values()).reduce((total, cache) => total + cache.size, 0);
  if (cachedCount < expectedUrls.length) {
    throw new Error(`Service worker cached ${cachedCount}/${expectedUrls.length} expected URLs.`);
  }

  const fetchListener = listeners.get("fetch");
  if (!fetchListener) throw new Error("Service worker does not register a fetch listener.");
  const fetchEvent = makeFetchEvent({ method: "GET", mode: "navigate", url: "https://local.test/" });
  fetchListener(fetchEvent);
  const response = await fetchEvent.response;
  if (response !== "cached:/index.html") {
    throw new Error("Offline navigation did not fall back to cached /index.html.");
  }
}

interface ExtendableEventLike {
  promises: Promise<unknown>[];
  waitUntil(promise: Promise<unknown>): void;
}

interface RequestLike {
  method: string;
  mode: string;
  url: string;
}

interface FetchEventLike extends ExtendableEventLike {
  request: RequestLike;
  response?: Promise<unknown>;
  respondWith(promise: Promise<unknown>): void;
}

function makeExtendableEvent(): ExtendableEventLike {
  return {
    promises: [],
    waitUntil(promise) {
      this.promises.push(promise);
    }
  };
}

function makeFetchEvent(request: RequestLike): FetchEventLike {
  return {
    ...makeExtendableEvent(),
    request,
    respondWith(promise) {
      this.response = promise;
    }
  };
}
