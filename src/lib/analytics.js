import { useMemo } from "react";

/**
 * @typedef {Object} Habit
 * @property {string} id
 * @property {string} name
 * @property {number} value_usd
 * @property {'daily'|'custom'|'weekly'} type
 * @property {boolean} archived
 * @property {string[]} [scheduledDates]  ISO dates, only for type "custom"
 * @property {number[]} [weekdays]        0=Sunday..6=Saturday, only for type "weekly"
 * @property {string[]} [excludedDates]   ISO dates removed from a recurring habit
 */

/**
 * @typedef {Object} Checkin
 * @property {string} id
 * @property {string} habit_id
 * @property {string} completed_date  ISO date
 * @property {string} [created_at]    timestamptz, when the check-in actually happened
 */

/**
 * @typedef {Object} TopHabitEntry
 * @property {string} habitId
 * @property {string} name
 * @property {number} totalSaved       all-time amount earned by this habit
 * @property {number} percentage       0-100, share of totalSavedAllTime
 */

/**
 * @typedef {Object} BestEarningHabit
 * @property {string} habitId
 * @property {string} name
 * @property {number} totalSaved
 */

/**
 * @typedef {Object} AnalyticsResult
 * @property {number} completionPercentage   0-100, share of scheduled habit-days completed within the period
 * @property {number} savedAmount            amount actually earned within the period
 * @property {number} targetAmount           theoretical max if every scheduled habit in the period had been completed
 * @property {number} totalSavedAllTime       amount earned across all check-ins ever recorded
 * @property {number[]} dailyTrend            amount earned per day, oldest first, length = trendDays
 * @property {BestEarningHabit|null} bestEarningHabit
 * @property {number} completedSessionCount  check-ins recorded within the period
 * @property {TopHabitEntry[]} top3Habits
 */

const toLocalISODate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const shiftDateStr = (iso, delta) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return toLocalISODate(d);
};

const startOfMonthStr = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return toLocalISODate(new Date(d.getFullYear(), d.getMonth(), 1));
};

// Same schedule rule as the calendar/home views: a habit counts as "due" on
// a given day if it isn't archived, isn't excluded that day, and (for
// custom/weekly types) actually falls on that day.
const isHabitDueOn = (habit, iso) => {
  if (habit.archived) return false;
  if ((habit.excludedDates || []).includes(iso)) return false;
  if (habit.type === "custom") return (habit.scheduledDates || []).includes(iso);
  if (habit.type === "weekly") return (habit.weekdays || []).includes(new Date(iso + "T00:00:00").getDay());
  return true; // "daily"
};

const eachDateInRange = (startIso, endIso) => {
  const dates = [];
  let cursor = startIso;
  while (cursor <= endIso) {
    dates.push(cursor);
    cursor = shiftDateStr(cursor, 1);
  }
  return dates;
};

/**
 * Pure, framework-agnostic analytics calculation. Takes the same
 * `habits`/`checkins` shapes already loaded by `loadUserData()` in
 * `src/lib/api.js` and derives every number the Analytics page needs.
 *
 * @param {Habit[]} habits
 * @param {Checkin[]} checkins
 * @param {Object} [options]
 * @param {string} [options.todayIso]      defaults to the real local date (YYYY-MM-DD)
 * @param {string} [options.periodStart]   defaults to the 1st of the current month
 * @param {string} [options.periodEnd]     defaults to todayIso
 * @param {number} [options.trendDays]     defaults to 7
 * @returns {AnalyticsResult}
 */
export function computeAnalytics(habits, checkins, options = {}) {
  const todayIso = options.todayIso || toLocalISODate(new Date());
  const periodStart = options.periodStart || startOfMonthStr(todayIso);
  const periodEnd = options.periodEnd || todayIso;
  const trendDays = options.trendDays ?? 7;

  const valueByHabit = new Map(habits.map((h) => [h.id, h.value_usd]));
  const nameByHabit = new Map(habits.map((h) => [h.id, h.name]));
  const checkinKeySet = new Set(checkins.map((c) => `${c.habit_id}|${c.completed_date}`));

  // --- completionPercentage / savedAmount / targetAmount / completedSessionCount ---
  let scheduledSlots = 0;
  let completedSlots = 0;
  let targetAmount = 0;
  let savedAmount = 0;

  for (const iso of eachDateInRange(periodStart, periodEnd)) {
    for (const habit of habits) {
      if (!isHabitDueOn(habit, iso)) continue;
      scheduledSlots += 1;
      targetAmount += habit.value_usd;
      if (checkinKeySet.has(`${habit.id}|${iso}`)) {
        completedSlots += 1;
        savedAmount += habit.value_usd;
      }
    }
  }

  const completionPercentage = scheduledSlots > 0 ? Math.round((completedSlots / scheduledSlots) * 100) : 0;

  const completedSessionCount = checkins.filter(
    (c) => c.completed_date >= periodStart && c.completed_date <= periodEnd
  ).length;

  // --- totalSavedAllTime / bestEarningHabit / top3Habits (all-time, not period-bound) ---
  const totalByHabit = new Map();
  for (const c of checkins) {
    const value = valueByHabit.get(c.habit_id) || 0;
    totalByHabit.set(c.habit_id, (totalByHabit.get(c.habit_id) || 0) + value);
  }

  const totalSavedAllTime = [...totalByHabit.values()].reduce((sum, v) => sum + v, 0);

  const ranked = [...totalByHabit.entries()]
    .map(([habitId, totalSaved]) => ({ habitId, name: nameByHabit.get(habitId) || "", totalSaved }))
    .sort((a, b) => b.totalSaved - a.totalSaved);

  const bestEarningHabit = ranked.length
    ? { habitId: ranked[0].habitId, name: ranked[0].name, totalSaved: ranked[0].totalSaved }
    : null;

  const top3Habits = ranked.slice(0, 3).map((entry) => ({
    ...entry,
    percentage: totalSavedAllTime > 0 ? Math.round((entry.totalSaved / totalSavedAllTime) * 100) : 0,
  }));

  // --- dailyTrend: amount earned per calendar day, oldest first ---
  const dailyTrend = [];
  for (let i = trendDays - 1; i >= 0; i--) {
    const iso = shiftDateStr(todayIso, -i);
    const dayTotal = checkins
      .filter((c) => c.completed_date === iso)
      .reduce((sum, c) => sum + (valueByHabit.get(c.habit_id) || 0), 0);
    dailyTrend.push(dayTotal);
  }

  return {
    completionPercentage,
    savedAmount,
    targetAmount,
    totalSavedAllTime,
    dailyTrend,
    bestEarningHabit,
    completedSessionCount,
    top3Habits,
  };
}

/**
 * React wrapper around `computeAnalytics`, memoized on the inputs that
 * actually change its output.
 *
 * @param {Habit[]} habits
 * @param {Checkin[]} checkins
 * @param {Object} [options] see `computeAnalytics`
 * @returns {AnalyticsResult}
 */
export function useAnalytics(habits, checkins, options = {}) {
  const { todayIso, periodStart, periodEnd, trendDays } = options;
  return useMemo(
    () => computeAnalytics(habits, checkins, { todayIso, periodStart, periodEnd, trendDays }),
    [habits, checkins, todayIso, periodStart, periodEnd, trendDays]
  );
}
