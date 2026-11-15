import assert from "node:assert/strict";
import { createServer } from "node:http";
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


test("a mapped public IPv4 address remains auditable", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => new Response("public page"));
  const result = await fetchChecked("http://[::ffff:808:808]/");
  assert.equal(result.text, "public page");
  assert.equal(fetchMock.mock.callCount(), 1);
});
