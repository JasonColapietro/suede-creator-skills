#!/usr/bin/env node
/**
 * Tell the IndexNow network which URLs a site serves, after a production deploy.
 *
 * IndexNow reaches Bing (which ChatGPT search and Copilot draw on), plus Yandex,
 * Seznam, Naver and Yep. Submitting to one participant shares it with all of them.
 * Google does not take part; the sitemap in Search Console is what covers Google.
 *
 * It reads the LIVE sitemaps, not a local build, so what it submits is exactly
 * what the deploy serves. It also fetches the live key file and refuses to post
 * unless it matches, because IndexNow answers a missing or wrong key with a bare
 * 403. A run that fires early, late or twice therefore cannot submit anything
 * wrong; at worst it resubmits unchanged URLs, which IndexNow treats as a no-op.
 *
 *   node scripts/indexnow-submit.mjs --site https://example.com \
 *     --sitemap /sitemap.xml --key-file public/<key>.txt [--dry-run]
 *
 * --site may repeat (one key file served on every host); each host is submitted
 * in its own request, because IndexNow rejects a URL outside the request's host
 * with a 422. --sitemap may repeat and is read on every --site. A <sitemapindex>
 * is followed one level down, same host only.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const ENDPOINT = "https://api.indexnow.org/indexnow";
export const MAX_URLS_PER_REQUEST = 10000;
const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

export function parseArgs(argv) {
  const opts = { sites: [], sitemaps: [], keyFile: null, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--site") opts.sites.push(argv[++i]);
    else if (arg === "--sitemap") opts.sitemaps.push(argv[++i]);
    else if (arg === "--key-file") opts.keyFile = argv[++i];
    else throw new Error(`unknown argument: ${arg}`);
  }
  if (opts.sites.length === 0) throw new Error("--site is required");
  if (opts.sitemaps.length === 0) opts.sitemaps.push("/sitemap.xml");
  if (!opts.keyFile) throw new Error("--key-file is required");
  for (const site of opts.sites) {
    const url = new URL(site);
    if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash) {
      throw new Error(`--site must be a bare https origin, got ${site}`);
    }
  }
  return opts;
}

/** The key is the file's basename; IndexNow requires the body to be exactly that. */
export function readKey(keyFile) {
  const name = path.basename(keyFile);
  if (!name.endsWith(".txt")) throw new Error(`${keyFile} must be named <key>.txt`);
  const key = name.slice(0, -4);
  if (!KEY_PATTERN.test(key)) throw new Error(`${name}: key must be 8-128 of [A-Za-z0-9-]`);
  const body = readFileSync(keyFile, "utf8");
  if (body.trim() !== key) throw new Error(`${name} must contain exactly its own key`);
  return { key, name };
}

export function locs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(([, loc]) => loc.replace(/&amp;/g, "&"));
}

async function getText(fetchImpl, url) {
  const res = await fetchImpl(url, { redirect: "follow", headers: { "user-agent": "indexnow-submit" } });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
}

/** Every page URL in the given sitemaps, same host only, de-duplicated, in order. */
export async function collectUrls(fetchImpl, origin, sitemapPaths) {
  const host = new URL(origin).host;
  const seen = new Set();
  const offHost = [];
  const add = (loc) => {
    let url;
    try { url = new URL(loc); } catch { offHost.push(loc); return; }
    if (url.protocol !== "https:" || url.host !== host) { offHost.push(loc); return; }
    seen.add(url.href);
  };
  for (const sitemapPath of sitemapPaths) {
    const sitemapUrl = new URL(sitemapPath, origin).href;
    const xml = await getText(fetchImpl, sitemapUrl);
    if (/<sitemapindex[\s>]/.test(xml)) {
      for (const child of locs(xml)) {
        if (new URL(child, origin).host !== host) { offHost.push(child); continue; }
        for (const loc of locs(await getText(fetchImpl, child))) add(loc);
      }
    } else {
      for (const loc of locs(xml)) add(loc);
    }
  }
  return { urls: [...seen], offHost };
}

export function chunk(list, size = MAX_URLS_PER_REQUEST) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/**
 * Submit one host. Returns "submitted", "dry-run", or "throttled".
 * Throws on anything that means the submission is broken rather than busy.
 */
export async function submitSite({ fetchImpl = fetch, origin, sitemaps, key, keyName, dryRun = false, log = console }) {
  const host = new URL(origin).host;
  const keyLocation = new URL(`/${keyName}`, origin).href;
  const { urls, offHost } = await collectUrls(fetchImpl, origin, sitemaps);
  if (offHost.length) log.warn(`${host}: skipped ${offHost.length} sitemap URL(s) outside the host, e.g. ${offHost[0]}`);
  if (urls.length === 0) throw new Error(`${host}: the sitemaps listed no URLs on this host`);
  log.log(`${host}: ${urls.length} URL(s), keyLocation ${keyLocation}`);
  if (dryRun) {
    log.log(`${host}: dry run, nothing sent. First ${urls[0]}, last ${urls[urls.length - 1]}`);
    return "dry-run";
  }

  const liveKey = (await getText(fetchImpl, keyLocation).catch((error) => {
    throw new Error(`${keyLocation} is not reachable (${error.message}); deploy the key file before submitting`);
  })).trim();
  if (liveKey !== key) throw new Error(`${keyLocation} does not serve the key; deploy it before submitting`);

  for (const urlList of chunk(urls)) {
    const res = await fetchImpl(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation, urlList }),
    });
    if (res.status === 429) {
      // Busy, not broken: the next deploy or the weekly run resubmits.
      log.warn(`${host}: IndexNow answered 429 (too many requests); leaving it for the next run`);
      return "throttled";
    }
    if (res.status !== 200 && res.status !== 202) {
      const detail = await res.text().catch(() => "");
      throw new Error(`${host}: IndexNow answered ${res.status} ${detail}`.trim());
    }
    log.log(`${host}: IndexNow accepted ${urlList.length} URL(s) (${res.status})`);
  }
  return "submitted";
}

export async function main(argv = process.argv.slice(2), { fetchImpl = fetch, log = console } = {}) {
  const opts = parseArgs(argv);
  const { key, name } = readKey(opts.keyFile);
  let failed = 0;
  for (const origin of opts.sites) {
    try {
      await submitSite({ fetchImpl, origin, sitemaps: opts.sitemaps, key, keyName: name, dryRun: opts.dryRun, log });
    } catch (error) {
      failed += 1;
      log.error(error.message);
    }
  }
  return failed === 0 ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().then((code) => { process.exitCode = code; }, (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
