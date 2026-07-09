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
});

export async function loadUserData(userId) {
  const [{ data: profile }, { data: balanceRow }, { data: habitRows }, { data: checkinRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("balances").select("*").eq("user_id", userId).single(),
    supabase.from("habits").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("checkins").select("*").eq("user_id", userId),
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
  };
}

export async function addDailyHabit(userId, name, value_usd) {
  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id: userId, name, value_usd, type: "daily" })
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

export async function addWeeklyHabit(userId, name, value_usd, weekdays) {
  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id: userId, name, value_usd, type: "weekly", weekdays })
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

export async function updateHabit(habitId, { name, value_usd }) {
  const { error } = await supabase.from("habits").update({ name, value_usd }).eq("id", habitId);
  if (error) throw error;
}

export async function deleteHabit(habitId) {
  const { error } = await supabase.from("habits").delete().eq("id", habitId);
  if (error) throw error;
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
