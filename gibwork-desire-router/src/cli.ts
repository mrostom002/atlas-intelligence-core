#!/usr/bin/env node
import { createBounty, discoverPublic } from "./gibwork.js";
import { routeDesire } from "./router.js";

function value(flag: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

function usage(): never {
  console.error(`Usage:\n  desire-router route \"<desired outcome>\" --budget 100 --hours 12\n  desire-router discover --min 50\n  desire-router prepare \"<desired outcome>\" --budget 100 --hours 12\n  desire-router create \"<desired outcome>\" --budget 100 --hours 12 --execute`);
  process.exit(2);
}

const [, , command, ...rest] = process.argv;
if (!command) usage();
const desire = rest.find((x) => !x.startsWith("--") && !/^\d+(\.\d+)?$/.test(x));
const budgetUsd = Number(value("--budget", "100"));
const deadlineHours = Number(value("--hours", "24"));
const localCapabilities = (value("--local", "research,writing,code,analysis") ?? "").split(",").filter(Boolean);

if (command === "route") {
  if (!desire) usage();
  console.log(JSON.stringify(routeDesire({ desire, budgetUsd, deadlineHours, localCapabilities, privacy: "sanitized" }), null, 2));
} else if (command === "discover") {
  console.log(JSON.stringify((await discoverPublic(Number(value("--min", "0")))).slice(0, 20), null, 2));
} else if (command === "prepare" || command === "create") {
  if (!desire) usage();
  const routed = routeDesire({ desire, budgetUsd, deadlineHours, localCapabilities, privacy: "sanitized" });
  if (!routed.brief) console.log(JSON.stringify({ routed, message: "No external bounty recommended." }, null, 2));
  else console.log(JSON.stringify({ routed, gibwork: await createBounty(routed.brief, command === "create" && process.argv.includes("--execute")) }, null, 2));
} else usage();
