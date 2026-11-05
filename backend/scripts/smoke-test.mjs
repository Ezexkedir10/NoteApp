#!/usr/bin/env node
/**
 * API smoke test for the Notes backend.
 *
 * Requirements: the backend AND PostgreSQL must be running. Needs Node 18+.
 * Usage:        npm run test:smoke
 * Custom URL:   API_URL=http://localhost:5000/api npm run test:smoke
 *
 * The script creates its own notes and deletes them again,
 * so it leaves your data untouched.
 */

const API_URL = (process.env.API_URL ?? "http://localhost:5000/api").replace(/\/+$/, "");
const MISSING_UUID = "00000000-0000-4000-8000-000000000000";

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? `  -> ${detail}` : ""}`);
  }
}

/** Sends a request; `rawBody` lets us deliberately send invalid JSON. */
async function call(method, path, { body, rawBody } = {}) {
  const hasBody = body !== undefined || rawBody !== undefined;
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  let json = null;
  try {
    json = await response.json();
  } catch {
    // response was not JSON; leave json as null
  }
  return { status: response.status, json };
}

function section(title) {
  console.log(`\n${title}`);
}

async function run() {
  const createdIds = [];

  try {
    section("Health check");
    const health = await call("GET", "/health");
    check("GET /health returns 200", health.status === 200, `status ${health.status}`);
    check("database is connected", health.json?.data?.database === "connected");

    section("Create (POST /notes)");
    const created = await call("POST", "/notes", {
      body: { title: "  Smoke test note  ", content: "Hello from the smoke test." },
    });
    check("returns 201", created.status === 201, `status ${created.status}`);
    check("response has success=true", created.json?.success === true);
    check("response has an id", typeof created.json?.data?.id === "string");
    check("title is trimmed", created.json?.data?.title === "Smoke test note");
    check("has createdAt and updatedAt", Boolean(created.json?.data?.createdAt && created.json?.data?.updatedAt));
    const note = created.json?.data;
    if (note?.id) createdIds.push(note.id);
    if (!note?.id) throw new Error("Cannot continue without a created note.");

    section("Create validation (POST /notes)");
    const invalidBodies = [
      ["empty title", { title: "", content: "x" }],
      ["whitespace-only title", { title: "   ", content: "x" }],
      ["empty content", { title: "x", content: "" }],
      ["whitespace-only content", { title: "x", content: " \n\t " }],
      ["missing fields", {}],
      ["non-string title", { title: 123, content: "x" }],
      ["title over 120 chars", { title: "a".repeat(121), content: "x" }],
    ];
    for (const [label, body] of invalidBodies) {
      const res = await call("POST", "/notes", { body });
      check(`rejects ${label} with 400`, res.status === 400 && res.json?.success === false, `status ${res.status}`);
    }
    const badJson = await call("POST", "/notes", { rawBody: "{ not valid json" });
    check("rejects malformed JSON with 400", badJson.status === 400, `status ${badJson.status}`);
    const noBody = await call("POST", "/notes");
    check("rejects missing body with 400", noBody.status === 400, `status ${noBody.status}`);

    section("Read all (GET /notes)");
    const list = await call("GET", "/notes");
    check("returns 200", list.status === 200, `status ${list.status}`);
    check("data is an array", Array.isArray(list.json?.data));
    check("contains the created note", list.json?.data?.some((n) => n.id === note.id));

    section("Read one (GET /notes/:id)");
    const one = await call("GET", `/notes/${note.id}`);
    check("returns 200", one.status === 200, `status ${one.status}`);
    check("returns the right note", one.json?.data?.id === note.id);
    const badId = await call("GET", "/notes/not-a-uuid");
    check("invalid id returns 400", badId.status === 400, `status ${badId.status}`);
    const missing = await call("GET", `/notes/${MISSING_UUID}`);
    check("nonexistent id returns 404", missing.status === 404, `status ${missing.status}`);

    section("Update (PUT /notes/:id)");
    await new Promise((resolve) => setTimeout(resolve, 20));
    const updated = await call("PUT", `/notes/${note.id}`, {
      body: { title: "Smoke test note (edited)", content: "Edited content." },
    });
    check("returns 200", updated.status === 200, `status ${updated.status}`);
    check("same id (existing record modified)", updated.json?.data?.id === note.id);
    check("title changed", updated.json?.data?.title === "Smoke test note (edited)");
    check("createdAt unchanged", updated.json?.data?.createdAt === note.createdAt);
    check("updatedAt moved forward", new Date(updated.json?.data?.updatedAt) > new Date(note.updatedAt));
    const reread = await call("GET", `/notes/${note.id}`);
    check("change persisted when re-read", reread.json?.data?.content === "Edited content.");
    const badUpdate = await call("PUT", `/notes/${note.id}`, { body: { title: "   ", content: "x" } });
    check("rejects whitespace-only title with 400", badUpdate.status === 400, `status ${badUpdate.status}`);
    const updateBadId = await call("PUT", "/notes/not-a-uuid", { body: { title: "a", content: "b" } });
    check("invalid id returns 400", updateBadId.status === 400, `status ${updateBadId.status}`);
    const updateMissing = await call("PUT", `/notes/${MISSING_UUID}`, { body: { title: "a", content: "b" } });
    check("nonexistent id returns 404", updateMissing.status === 404, `status ${updateMissing.status}`);

    section("Delete (DELETE /notes/:id)");
    const deleteBadId = await call("DELETE", "/notes/not-a-uuid");
    check("invalid id returns 400", deleteBadId.status === 400, `status ${deleteBadId.status}`);
    const deleted = await call("DELETE", `/notes/${note.id}`);
    check("returns 200", deleted.status === 200, `status ${deleted.status}`);
    createdIds.splice(createdIds.indexOf(note.id), 1);
    const afterDelete = await call("GET", `/notes/${note.id}`);
    check("deleted note returns 404 afterwards", afterDelete.status === 404, `status ${afterDelete.status}`);
    const listAfter = await call("GET", "/notes");
    check("deleted note not in list", !listAfter.json?.data?.some((n) => n.id === note.id));
    const deleteAgain = await call("DELETE", `/notes/${note.id}`);
    check("deleting twice returns 404", deleteAgain.status === 404, `status ${deleteAgain.status}`);

    section("Unknown route");
    const unknown = await call("GET", "/does-not-exist");
    check("returns 404 JSON", unknown.status === 404 && unknown.json?.success === false, `status ${unknown.status}`);
  } finally {
    // Clean up anything left behind if the run stopped early.
    for (const id of createdIds) {
      await call("DELETE", `/notes/${id}`).catch(() => undefined);
    }
  }
}

console.log(`Notes API smoke test -> ${API_URL}`);

run()
  .catch((error) => {
    failed += 1;
    const unreachable = error?.cause?.code === "ECONNREFUSED" || error instanceof TypeError;
    console.error(
      unreachable
        ? `\nCould not reach ${API_URL}. Is the backend running? (npm run dev)`
        : `\nUnexpected error: ${error?.message ?? error}`
    );
  })
  .finally(() => {
    console.log(`\nResult: ${passed} passed, ${failed} failed`);
    process.exit(failed === 0 ? 0 : 1);
  });
