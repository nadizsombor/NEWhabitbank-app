// Standalone sanity check for src/lib/analytics.js — run with:
//   node scripts/debug-analytics.mjs           (mock data)
//   node scripts/debug-analytics.mjs --real    (scripts/real-data.json)
//
// This app is a Vite SPA that talks to Supabase directly from the browser
// (no backend/API routes exist to hang a "/api/analytics/debug" endpoint
// off of), so this script is the equivalent debug entry point: it feeds
// computeAnalytics() a habits/checkins dataset - in the same shape
// loadUserData() in src/lib/api.js returns - and prints the result.
//
// --real reads scripts/real-data.json, which should look like:
//   { "habits": [...], "checkins": [...] }
// (the exact object the temporary ANALYTICS_DEBUG_JSON console.log in
// App.jsx prints after loadUserData() resolves).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { computeAnalytics } from "../src/lib/analytics.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const useReal = process.argv.includes("--real");

const todayIso = new Date().toISOString().slice(0, 10);
const shiftDateStr = (iso, delta) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
};

function loadMockData() {
  const habits = [
    { id: "h1", name: "Workout", value_usd: 500, type: "daily", archived: false, excludedDates: [] },
    { id: "h2", name: "Read", value_usd: 300, type: "daily", archived: false, excludedDates: [] },
    {
      id: "h3",
      name: "Meal prep",
      value_usd: 800,
      type: "weekly",
      weekdays: [0, 3], // Sunday + Wednesday
      archived: false,
      excludedDates: [],
    },
  ];

  // 20 days of history ending today; ~65% completion, "Workout" earns the most.
  const checkins = [];
  for (let i = 19; i >= 0; i--) {
    const iso = shiftDateStr(todayIso, -i);
    const dow = new Date(iso + "T00:00:00").getDay();
    if (i % 3 !== 0) checkins.push({ id: `c-h1-${iso}`, habit_id: "h1", completed_date: iso, created_at: `${iso}T08:00:00Z` });
    if (i % 2 === 0) checkins.push({ id: `c-h2-${iso}`, habit_id: "h2", completed_date: iso, created_at: `${iso}T20:00:00Z` });
    if ((dow === 0 || dow === 3) && i % 4 !== 0) {
      checkins.push({ id: `c-h3-${iso}`, habit_id: "h3", completed_date: iso, created_at: `${iso}T12:00:00Z` });
    }
  }
  // targetAmount now comes from the balance (locked + withdrawable), same as
  // the Home page's balance cards - not a theoretical schedule-based figure.
  const balance = { locked_amount: 8500, withdrawable_amount: 1500 };
  return { habits, checkins, balance };
}

function loadRealData() {
  const filePath = path.join(__dirname, "real-data.json");
  let raw;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch (e) {
    console.error(`Could not read ${filePath}`);
    console.error("Create it first: paste the ANALYTICS_DEBUG_JSON console output into scripts/real-data.json.");
    process.exit(1);
  }
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.habits) || !Array.isArray(parsed.checkins)) {
    console.error(`${filePath} must be an object with "habits" and "checkins" arrays.`);
    process.exit(1);
  }
  if (!parsed.balance) {
    console.warn(
      `Note: ${filePath} has no "balance" field - targetAmount will be $0. ` +
        `Add { "balance": { "locked_amount": ..., "withdrawable_amount": ... } } to test it.`
    );
  }
  return parsed;
}

const { habits, checkins, balance } = useReal ? loadRealData() : loadMockData();
const result = computeAnalytics(habits, checkins, { todayIso, trendDays: 7, balance });

console.log(`=== useAnalytics debug (${useReal ? "real data from scripts/real-data.json" : "mock data"}) ===`);
console.log("todayIso:", todayIso, "| period: current month up to todayIso\n");
console.table({
  completionPercentage: result.completionPercentage,
  savedAmount: result.savedAmount,
  targetAmount: result.targetAmount,
  totalSavedAllTime: result.totalSavedAllTime,
  completedSessionCount: result.completedSessionCount,
});
console.log("\ndailyTrend (oldest -> newest):", result.dailyTrend);
console.log("\nbestEarningHabit:", result.bestEarningHabit);
console.log("\ntop3Habits:");
console.table(result.top3Habits);
