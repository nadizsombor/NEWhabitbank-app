import { supabase } from "./supabaseClient";

const fromDbHabit = (h) => ({
  id: h.id,
  name: h.name,
  value_usd: h.value_usd,
  type: h.type,
  archived: h.archived,
  scheduledDates: h.scheduled_dates || [],
  weekdays: h.weekdays || [],
  excludedDates: h.excluded_dates || [],
  endDate: h.end_date || null,
  deletedAt: h.deleted_at || null,
});

export async function loadUserData(userId) {
  const [{ data: profile }, { data: balanceRow }, { data: habitRows }, { data: checkinRows }, { data: historyRows }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("balances").select("*").eq("user_id", userId).single(),
      supabase.from("habits").select("*").eq("user_id", userId).order("created_at"),
      supabase.from("checkins").select("*").eq("user_id", userId),
      supabase.from("habit_history_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

  return {
    profile,
    balance: {
      locked_amount: balanceRow?.locked_amount ?? 0,
      withdrawable_amount: balanceRow?.withdrawable_amount ?? 0,
      withdrawn_at: balanceRow?.withdrawn_at ?? null,
    },
    habits: (habitRows || []).map(fromDbHabit),
    checkins: (checkinRows || []).map((c) => ({
      id: c.id,
      habit_id: c.habit_id,
      completed_date: c.completed_date,
      created_at: c.created_at,
    })),
    historyLogs: historyRows || [],
  };
}

// Inserts a single row into habit_history_logs. `message` is the exact,
// already-localized text to display in the Habit History feed - generated
// once at the moment of the action, not re-derived later.
export async function logHabitAction(userId, habitId, actionType, message) {
  const { data, error } = await supabase
    .from("habit_history_logs")
    .insert({ user_id: userId, habit_id: habitId, action_type: actionType, message })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addDailyHabit(userId, name, value_usd, endDate = null) {
  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id: userId, name, value_usd, type: "daily", end_date: endDate })
    .select()
    .single();
  if (error) throw error;
  return fromDbHabit(data);
}

export async function addCustomHabit(userId, name, value_usd, scheduledDates) {
  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id: userId, name, value_usd, type: "custom", scheduled_dates: scheduledDates })
    .select()
    .single();
  if (error) throw error;
  return fromDbHabit(data);
}

export async function addWeeklyHabit(userId, name, value_usd, weekdays, endDate = null) {
  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id: userId, name, value_usd, type: "weekly", weekdays, end_date: endDate })
    .select()
    .single();
  if (error) throw error;
  return fromDbHabit(data);
}

export async function setBalanceAmounts(userId, locked_amount, withdrawable_amount) {
  const { error } = await supabase
    .from("balances")
    .update({ locked_amount, withdrawable_amount })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function withdrawBalance(userId, locked_amount) {
  const withdrawn_at = new Date().toISOString();
  const { error } = await supabase
    .from("balances")
    .update({ locked_amount, withdrawable_amount: 0, withdrawn_at })
    .eq("user_id", userId);
  if (error) throw error;
  return withdrawn_at;
}

export async function addCheckin(userId, habitId, completedDate) {
  const { data, error } = await supabase
    .from("checkins")
    .insert({ user_id: userId, habit_id: habitId, completed_date: completedDate })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeCheckin(habitId, completedDate) {
  const { error } = await supabase
    .from("checkins")
    .delete()
    .eq("habit_id", habitId)
    .eq("completed_date", completedDate);
  if (error) throw error;
}

// `fields` uses the same JS-side (camelCase) shape as a habit object; only
// keys that are actually present get written, everything else is left alone.
export async function updateHabit(habitId, fields) {
  const payload = {};
  if (fields.name !== undefined) payload.name = fields.name;
  if (fields.value_usd !== undefined) payload.value_usd = fields.value_usd;
  if (fields.type !== undefined) payload.type = fields.type;
  if (fields.weekdays !== undefined) payload.weekdays = fields.weekdays;
  if (fields.scheduledDates !== undefined) payload.scheduled_dates = fields.scheduledDates;
  if (fields.excludedDates !== undefined) payload.excluded_dates = fields.excludedDates;
  if (fields.endDate !== undefined) payload.end_date = fields.endDate;
  const { error } = await supabase.from("habits").update(payload).eq("id", habitId);
  if (error) throw error;
}

// Moves a single check-in to a different habit_id. Used when a mistakenly
// recurring (daily/weekly) habit gets corrected to a one-off event for just
// one day: that day's check-in (if it exists) needs to follow the value it
// actually belongs to, not stay attached to the still-recurring original.
export async function reassignCheckin(oldHabitId, newHabitId, completedDate) {
  const { error } = await supabase
    .from("checkins")
    .update({ habit_id: newHabitId })
    .eq("habit_id", oldHabitId)
    .eq("completed_date", completedDate);
  if (error) throw error;
}

export async function deleteHabit(habitId) {
  const { error } = await supabase.from("habits").delete().eq("id", habitId);
  if (error) throw error;
}

// Soft delete: hides the habit from future scheduling but keeps the row (and
// therefore its check-in history, referenced by checkins.habit_id) intact -
// a real DELETE would cascade-delete those check-ins and erase real history.
export async function softDeleteHabit(habitId) {
  const deleted_at = new Date().toISOString();
  const { error } = await supabase.from("habits").update({ deleted_at }).eq("id", habitId);
  if (error) throw error;
  return deleted_at;
}

export async function setHabitExcludedDates(habitId, excludedDates) {
  const { error } = await supabase.from("habits").update({ excluded_dates: excludedDates }).eq("id", habitId);
  if (error) throw error;
}

export async function setHabitArchived(habitId, archived) {
  const { error } = await supabase.from("habits").update({ archived }).eq("id", habitId);
  if (error) throw error;
}

// TODO: remove before production. Dev-only "reset my account" helper used by
// the temporary debug button in the Analytics page - wipes check-in history
// and zeroes the balance for the CURRENT user only (both queries are scoped
// with .eq("user_id", userId), and RLS policies on checkins/balances already
// restrict delete/update to auth.uid() = user_id, so this can never touch
// another user's row even if called with a spoofed id).
export async function resetUserDataForDev(userId) {
  const { error: checkinsError } = await supabase.from("checkins").delete().eq("user_id", userId);
  if (checkinsError) throw checkinsError;

  const { error: balanceError } = await supabase
    .from("balances")
    .update({ locked_amount: 0, withdrawable_amount: 0 })
    .eq("user_id", userId);
  if (balanceError) throw balanceError;
}
