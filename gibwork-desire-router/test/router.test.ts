import assert from "node:assert/strict";
import test from "node:test";
import { routeDesire } from "../src/router.js";

test("routes external human work to a bounty", () => {
  const result = routeDesire({ desire: "Record three UGC videos in Cairo and attach source files", budgetUsd: 100, deadlineHours: 12, localCapabilities: ["research", "writing"], privacy: "sanitized" });
  assert.equal(result.decision, "DELEGATE");
  assert.ok(result.brief);
  assert.equal(result.brief?.budgetUsd, 100);
});

test("keeps matching local analysis local", () => {
  const result = routeDesire({ desire: "analysis of this dataset", budgetUsd: 30, deadlineHours: 4, localCapabilities: ["analysis"], privacy: "sanitized" });
  assert.equal(result.decision, "LOCAL");
  assert.equal(result.brief, undefined);
});

test("gates consequential actions behind human approval", () => {
  const result = routeDesire({ desire: "Pay the selected contractor and publish the result", budgetUsd: 100, deadlineHours: 2, localCapabilities: ["research"], privacy: "sanitized" });
  assert.equal(result.decision, "HUMAN_APPROVAL");
  assert.ok(result.blockedActions.includes("automatic payment"));
});

test("sensitive data never auto-routes to a public bounty", () => {
  const result = routeDesire({ desire: "Review customer records", budgetUsd: 100, deadlineHours: 8, localCapabilities: ["analysis"], privacy: "sensitive" });
  assert.equal(result.decision, "HUMAN_APPROVAL");
});
