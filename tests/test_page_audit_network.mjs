import assert from "node:assert/strict";
import http, { createServer } from "node:http";
import dns from "node:dns/promises";
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { gzipSync } from "node:zlib";
import { once } from "node:events";
import { test } from "node:test";
import { fetchChecked } from "../mcp/page-audit.mjs";

test("mapped IPv6 loopback cannot reach a local HTTP service", async () => {
  let requests = 0;
  const server = createServer((_req, res) => {
    requests += 1;
    res.end("private sentinel");
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const port = server.address().port;
    for (const address of ["::ffff:127.0.0.1", "::ffff:7f00:1", "0:0:0:0:0:ffff:7f00:1"]) {
      await assert.rejects(fetchChecked(`http://[${address}]:${port}/`), /private or reserved/);
    }
    assert.equal(requests, 0, "the private service must receive no HTTP request");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

for (const address of ["::ffff:a9fe:a9fe", "fe90::1", "febf::1", "0:0:0:0:0:0:0:1"]) {
  test(`rejects private IPv6 ${address} before fetching`, async () => {
    await assert.rejects(fetchChecked(`http://[${address}]/`), /private or reserved/);
  });
}


function stubRequest(t, inspect, response = {}) {
  return t.mock.method(http, "request", (url, options, onResponse) => {
    const request = new EventEmitter();
    request.end = () => queueMicrotask(async () => {
      try {
        await inspect(url, options);
        const incoming = Readable.from([Buffer.from(response.text || "public page")]);
        incoming.headers = response.headers || { "content-type": "text/html" };
        incoming.statusCode = response.status || 200;
        onResponse(incoming);
      } catch (error) { request.emit("error", error); }
    });
    return request;
  });
}

test("a mapped public IPv4 address remains auditable", async (t) => {
  const request = stubRequest(t, () => {});
  const result = await fetchChecked("http://[::ffff:808:808]/");
  assert.equal(result.text, "public page");
  assert.equal(request.mock.callCount(), 1);
});

test("socket lookup reuses validated DNS answers after a hostile rebind", async (t) => {
  const dnsMock = t.mock.method(dns, "lookup", async () => [{ address: "93.184.216.34", family: 4 }]);
  const request = stubRequest(t, async (url, options) => {
    assert.equal(url.hostname, "rebind.example");
    assert.equal(options.agent, false);
    dnsMock.mock.mockImplementation(async () => [{ address: "127.0.0.1", family: 4 }]);
    const lookup = (all) => new Promise((resolve, reject) => options.lookup(url.hostname, { all }, (err, address) => err ? reject(err) : resolve(address)));
    assert.equal(await lookup(false), "93.184.216.34");
    assert.deepEqual(await lookup(true), [{ address: "93.184.216.34", family: 4 }]);
  });
  assert.equal((await fetchChecked("http://rebind.example/")).status, 200);
  assert.equal(request.mock.callCount(), 1);
  assert.equal(dnsMock.mock.callCount(), 1);
});

test("redirects cannot reach private destinations", async (t) => {
  t.mock.method(dns, "lookup", async () => [{ address: "93.184.216.34", family: 4 }]);
  const request = stubRequest(t, () => {}, { status: 302, headers: { location: "http://169.254.169.254/" } });
  await assert.rejects(fetchChecked("http://public.example/"), /private or reserved/);
  assert.equal(request.mock.callCount(), 1);
});

test("rejects embedded credentials before a socket is created", async (t) => {
  const request = stubRequest(t, () => {});
  await assert.rejects(fetchChecked("http://user:password@public.example/"), /credentials/);
  assert.equal(request.mock.callCount(), 0);
});

test("byte limits and one deadline cover real streamed and compressed bodies", async () => {
  const server = createServer((req, res) => {
    if (req.url === "/hang") { res.write("pending"); return; }
    if (req.url === "/gzip") { res.setHeader("content-encoding", "gzip"); res.end(gzipSync("x".repeat(1000))); return; }
    res.end("x".repeat(1000));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of ["/plain", "/gzip"]) {
      const result = await fetchChecked(base + path, { allowPrivate: true, maxBytes: 16 });
      assert.equal(result.text.length, 16);
      assert.equal(result.truncated, true);
    }
    await assert.rejects(fetchChecked(base + "/hang", { allowPrivate: true, timeoutMs: 40 }), /timed out/);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});


test("DNS lookup cannot outlive the audit deadline", async (t) => {
  const keepAlive = setTimeout(() => {}, 1000);
  t.after(() => clearTimeout(keepAlive));
  t.mock.method(dns, "lookup", () => new Promise(() => {}));
  const request = stubRequest(t, () => {});
  await assert.rejects(fetchChecked("http://slow-dns.example/", { timeoutMs: 30 }), /timed out/);
  assert.equal(request.mock.callCount(), 0);
});


test("a hostile nonstandard status becomes an audit error", async (t) => {
  t.mock.method(dns, "lookup", async () => [{ address: "93.184.216.34", family: 4 }]);
  stubRequest(t, () => {}, { status: 700 });
  await assert.rejects(fetchChecked("http://public.example/"), /response status/);
});
