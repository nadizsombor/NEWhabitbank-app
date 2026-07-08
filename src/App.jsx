import React, { useState, useMemo, useCallback, useEffect } from "react";
import bgImage from "./assets/bg.jpg";
import {
  Landmark,
  Home,
  BarChart3,
  User,
  Flame,
  Lock,
  Check,
  Loader2,
  Plus,
  X,
  Mail,
  Shield,
  CalendarDays,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Trash2,
  SlidersHorizontal,
  Repeat,
  Sun,
  Moon,
} from "lucide-react";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { supabase } from "./lib/supabaseClient";
import {
  loadUserData,
  addDailyHabit,
  addCustomHabit,
  addWeeklyHabit,
  setBalanceAmounts,
  withdrawBalance,
  addCheckin,
  removeCheckin,
  updateHabit,
  deleteHabit,
  setHabitExcludedDates,
  setHabitArchived,
} from "./lib/api";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap');
  .hb-glass {
    position: relative;
    overflow: hidden;
    background: #FFFFFF;
    border: 1px solid #E9E9E7;
  }
  .hb-glass:hover {
    background: #F5F5F4;
  }
  .dark .hb-glass {
    background: #1F1F1F;
    border: 1px solid #333333;
  }
  .dark .hb-glass:hover {
    background: #262626;
  }
`;


function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: C.background,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "transparent",
        }}
      />
    </div>
  );
}

const SYSTEM_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const LIGHT_COLORS = {
  background: "#FFFFFF",
  foreground: "#191919",
  card: "#FFFFFF",
  primary: "#191919",
  primaryForeground: "#FFFFFF",
  secondary: "#F1F1EF",
  secondaryForeground: "#191919",
  muted: "#F7F7F5",
  mutedForeground: "#787774",
  accent: "#787774",
  destructive: "#E03E3E",
  destructiveForeground: "#FFFFFF",
  destructiveMuted: "#FDECEC",
  border: "#E9E9E7",
  slatePill: "transparent",
};

const DARK_COLORS = {
  background: "#171717",
  foreground: "#F5F5F5",
  card: "#1F1F1F",
  primary: "#F5F5F5",
  primaryForeground: "#171717",
  secondary: "#2A2A2A",
  secondaryForeground: "#F5F5F5",
  muted: "#262626",
  mutedForeground: "#A3A3A3",
  accent: "#A3A3A3",
  destructive: "#F87171",
  destructiveForeground: "#171717",
  destructiveMuted: "#3A2020",
  border: "#333333",
  slatePill: "transparent",
};

// Mutated (not re-created) on every App() render so every component reading
// C.xxx during its own render picks up the current theme's values without
// needing its own theme subscription - see App()'s render body.
let C = LIGHT_COLORS;

const heading = { fontFamily: SYSTEM_FONT, fontWeight: 700, letterSpacing: "-0.015em" };
const mono = { fontFamily: "'Roboto Mono', monospace" };
const body = { fontFamily: SYSTEM_FONT, fontWeight: 400 };

/* ------------------------------- i18n ------------------------------- */

const TRANSLATIONS = {
  "auth.email": { en: "Email", hu: "E-mail cím" },
  "auth.password": { en: "Password", hu: "Jelszó" },
  "auth.forgotPassword": { en: "Forgot password?", hu: "Elfelejtett jelszó?" },
  "auth.logIn": { en: "Log In", hu: "Bejelentkezés" },
  "auth.loggingIn": { en: "Logging in...", hu: "Bejelentkezés..." },
  "auth.or": { en: "or", hu: "vagy" },
  "auth.continueGoogle": { en: "Continue with Google", hu: "Folytatás Google fiókkal" },
  "auth.noAccount": { en: "No account?", hu: "Nincs még fiókod?" },
  "auth.register": { en: "Register", hu: "Regisztráció" },
  "auth.creatingAccount": { en: "Creating account...", hu: "Fiók létrehozása..." },
  "auth.alreadyHaveAccount": { en: "Already have an account?", hu: "Már van fiókod?" },
  "auth.back": { en: "Back", hu: "Vissza" },
  "auth.otpTitle": { en: "Verify your email", hu: "E-mail cím megerősítése" },
  "auth.otpDesc": { en: "Enter the 6-digit code sent to", hu: "Add meg a 6 jegyű kódot, amit elküldtünk ide:" },
  "auth.otpFallback": { en: "your email", hu: "az e-mail címedre" },
  "auth.verificationCode": { en: "Verification code", hu: "Megerősítő kód" },
  "auth.verifying": { en: "Verifying...", hu: "Ellenőrzés..." },
  "auth.verifyContinue": { en: "Verify & Continue", hu: "Megerősítés és folytatás" },
  "forgot.title": { en: "Reset your password", hu: "Jelszó visszaállítása" },
  "forgot.desc": { en: "Enter your email and we'll send you a reset link.", hu: "Add meg az e-mail címed, és küldünk egy visszaállító linket." },
  "forgot.sendLink": { en: "Send Reset Link", hu: "Visszaállító link küldése" },
  "forgot.checkInbox": { en: "Check your inbox", hu: "Nézd meg a postaládád" },
  "forgot.sentDesc": { en: "We sent a reset link to", hu: "Elküldtük a visszaállító linket ide:" },
  "forgot.haveLink": { en: "I have a reset link", hu: "Van visszaállító linkem" },
  "forgot.backToLogin": { en: "Back to Log In", hu: "Vissza a bejelentkezéshez" },
  "reset.title": { en: "Set new password", hu: "Új jelszó beállítása" },
  "reset.desc": { en: "Choose a new password for your account.", hu: "Válassz új jelszót a fiókodhoz." },
  "reset.newPassword": { en: "New password", hu: "Új jelszó" },
  "reset.confirmPassword": { en: "Confirm password", hu: "Jelszó megerősítése" },
  "reset.saving": { en: "Saving...", hu: "Mentés..." },
  "reset.resetPassword": { en: "Reset Password", hu: "Jelszó visszaállítása" },
  "toast.passwordUpdated": { en: "Password updated. Please log in.", hu: "Jelszó frissítve. Kérjük, jelentkezz be." },
  "toast.welcomeBack": { en: "Welcome back!", hu: "Üdvözlünk újra!" },
  "toast.logoutHint": { en: "Use the Profile tab to log out", hu: "A kijelentkezéshez használd a Profil fület" },
  "toast.topUpSuffix": { en: "added to locked balance", hu: "hozzáadva a zárolt egyenleghez" },
  "toast.withdrawComplete": { en: "Withdrawal complete", hu: "Kifizetés kész" },
  "toast.habitCreated": { en: "Habit created", hu: "Szokás létrehozva" },
  "toast.insufficientBalance": { en: "Insufficient balance", hu: "Nincs elég egyenleg" },
  "toast.earnedSuffix": { en: "earned", hu: "megszerezve" },
  "nav.home": { en: "Home", hu: "Kezdőlap" },
  "nav.analytics": { en: "Analytics", hu: "Statisztika" },
  "nav.profile": { en: "Profile", hu: "Profil" },
  "nav.habitCalendar": { en: "Habit Calendar", hu: "Szokásnaptár" },
  "calendar.title": { en: "Habit Calendar", hu: "Szokásnaptár" },
  "calendar.addHabits": { en: "Add habits", hu: "Szokások hozzáadása" },
  "calendar.monthly": { en: "Monthly", hu: "Havi" },
  "calendar.weekly": { en: "Weekly", hu: "Heti" },
  "calendar.daily": { en: "Daily", hu: "Napi" },
  "calendar.today": { en: "Today", hu: "Ma" },
  "calendar.noHabitsThisDay": { en: "No habits scheduled", hu: "Nincs beütemezett szokás" },
  "balance.withdrawable": { en: "Withdrawable", hu: "Kivehető" },
  "balance.cardholder": { en: "Cardholder", hu: "Kártyabirtokos" },
  "balance.withdraw": { en: "Withdraw", hu: "Kifizetés" },
  "balance.locked": { en: "Locked", hu: "Zárolt" },
  "balance.topUp": { en: "Top Up Balance", hu: "Egyenleg feltöltése" },
  "balance.savedLabel": { en: "You have saved:", hu: "Megtakarítottál:" },
  "balance.savedSubtitle": { en: "with completed habits", hu: "teljesített szokásokkal" },
  "balance.invest": { en: "Invest more", hu: "Feltöltés" },
  "balance.unlock": { en: "Unlock", hu: "Feloldás" },
  "modal.unlockTitle": { en: "Unlock Locked Funds", hu: "Zárolt egyenleg feloldása" },
  "modal.unlockDesc": {
    en: "This instantly moves your entire locked balance to withdrawable, skipping habit completion.",
    hu: "Ez azonnal átmozgatja a teljes zárolt egyenleget a kivehetőbe, a szokások teljesítése nélkül.",
  },
  "modal.confirmUnlock": { en: "Unlock Funds", hu: "Egyenleg feloldása" },
  "home.addHabitsToday": { en: "Add Habits for Today", hu: "Adj hozzá szokásokat mára" },
  "home.addHabitsFor": { en: "Add Habits for", hu: "Adj hozzá szokásokat —" },
  "streak.suffix": { en: "days streak", hu: "napos sorozat" },
  "home.todaysHabits": { en: "Today's Habits", hu: "Mai szokások" },
  "home.habitsFor": { en: "Habits —", hu: "Szokások —" },
  "home.backToToday": { en: "Back to today", hu: "Ugrás a mai napra" },
  "home.addHabit": { en: "Add Habit", hu: "Új szokás" },
  "home.addNewHabit": { en: "Add a new habit", hu: "Új szokás hozzáadása" },
  "home.noHabits": { en: "No habits yet", hu: "Még nincsenek szokások" },
  "home.noHabitsToday": { en: "No habits scheduled for this day", hu: "Erre a napra nincs beütemezett szokás" },
  "home.addFirstHabit": { en: "Add your first habit", hu: "Add hozzá az elsőt" },
  "toast.movedBackSuffix": { en: "moved back to locked", hu: "visszakerült a zároltba" },
  "modal.amount": { en: "Amount", hu: "Összeg" },
  "modal.confirmTopUp": { en: "Confirm Top Up", hu: "Feltöltés megerősítése" },
  "modal.withdrawableAmount": { en: "Withdrawable amount", hu: "Kivehető összeg" },
  "modal.confirmWithdraw": { en: "Confirm Withdraw", hu: "Kifizetés megerősítése" },
  "modal.addHabitTitle": { en: "Add Habit", hu: "Szokás hozzáadása" },
  "modal.name": { en: "Name", hu: "Név" },
  "modal.namePlaceholder": { en: "e.g. Workout", hu: "pl. Edzés" },
  "modal.valuePerCompletion": { en: "Value per completion (USD)", hu: "Érték teljesítésenként (USD)" },
  "modal.createHabit": { en: "Create Habit", hu: "Szokás létrehozása" },
  "habitType.chooseTitle": { en: "What kind of habit?", hu: "Milyen típusú szokást adsz hozzá?" },
  "habitType.daily": { en: "Daily Habit", hu: "Napi szokás" },
  "habitType.dailyDesc": { en: "Shows up every single day", hu: "Minden nap megjelenik" },
  "habitType.custom": { en: "Custom Schedule", hu: "Egyéni napok" },
  "habitType.customDesc": { en: "Pick specific days on a calendar", hu: "Válaszd ki a napokat egy naptárból" },
  "modal.customHabitTitle": { en: "Custom Schedule Habit", hu: "Egyéni napos szokás" },
  "modal.selectDays": { en: "Select days", hu: "Napok kiválasztása" },
  "modal.daysSelected": { en: "days selected", hu: "nap kiválasztva" },
  "modal.noDaysSelected": { en: "Pick at least one day on the calendar", hu: "Válassz ki legalább egy napot a naptárban" },
  "modal.frequency": { en: "Frequency", hu: "Gyakoriság" },
  "modal.exactDate": { en: "Exact Date", hu: "Pontos dátum" },
  "modal.exactDateDesc": { en: "One-time event on a specific date", hu: "Egyszeri esemény egy adott napon" },
  "modal.customRecurrence": { en: "Custom Recurrence", hu: "Egyedi ismétlődés" },
  "modal.customRecurrenceDesc": { en: "Pick specific days of the week", hu: "Válaszd ki a hét konkrét napjait" },
  "modal.noWeekdaysSelected": { en: "Pick at least one day of the week", hu: "Válassz ki legalább egy napot a hétből" },
  "home.dailySavedLabel": { en: "Saved today", hu: "Ma megtakarítva" },
  "home.manageHabits": { en: "Manage habits", hu: "Szokások kezelése" },
  "modal.manageHabitsTitle": { en: "Manage Habits", hu: "Szokások kezelése" },
  "modal.addNewHabitRow": { en: "Add new habit", hu: "Új szokás hozzáadása" },
  "modal.save": { en: "Save", hu: "Mentés" },
  "modal.edit": { en: "Edit", hu: "Szerkesztés" },
  "modal.confirmUncheckTitle": { en: "Undo check-in?", hu: "Visszavonod a pipát?" },
  "modal.confirmUncheckDesc": {
    en: "The money for this habit will move back to your locked balance.",
    hu: "Ennek a szokásnak az összege visszakerül a zárolt egyenlegbe.",
  },
  "modal.confirmPastCheckinDesc": {
    en: "Are you sure you want to check off this past activity? Important: checking off past habits is final — you won't be able to undo or change it later.",
    hu: "Biztosan ki szeretnéd pipálni ezt a múltbéli tevékenységet? Fontos: a múltbeli szokások utólagos kipipálása végleges, ezt később már nem tudod visszavonni vagy módosítani.",
  },
  "modal.cancelPastCheckin": { en: "Cancel", hu: "Mégsem" },
  "modal.confirmPastCheckin": { en: "Check off", hu: "Kipipálás" },
  "modal.confirmDeleteHabitTitle": { en: "Delete habit?", hu: "Törlöd a szokást?" },
  "modal.confirmDeleteHabitDesc": {
    en: "This permanently deletes the habit and all of its check-in history.",
    hu: "Ez véglegesen törli a szokást és az összes hozzá tartozó check-in előzményt.",
  },
  "modal.confirm": { en: "Confirm", hu: "Megerősítés" },
  "modal.cancel": { en: "Cancel", hu: "Mégse" },
  "modal.delete": { en: "Delete", hu: "Törlés" },
  "modal.confirmRecurringDeleteTitle": { en: "Delete habit?", hu: "Törlöd a szokást?" },
  "modal.confirmRecurringDeleteDesc": {
    en: "This is a recurring habit. Remove it from just this day, or delete it completely?",
    hu: "Ez egy visszatérő szokás. Csak erről a napról távolítsd el, vagy töröld teljesen?",
  },
  "modal.deleteThisDayOnly": { en: "Remove from this day only", hu: "Eltávolítás csak erről a napról" },
  "modal.deleteEntireHabit": { en: "Delete entire habit", hu: "Teljes szokás törlése" },
  "calendar.addHabitForDay": { en: "Add habit for this day", hu: "Szokás hozzáadása erre a napra" },
  "calendar.editDay": { en: "Edit day", hu: "Nap szerkesztése" },
  "calendar.resetCalendar": { en: "Reset Calendar", hu: "Naptár visszaállítása" },
  "modal.resetCalendarTitle": { en: "Reset Calendar", hu: "Naptár visszaállítása" },
  "modal.resetCalendarWarning": { en: "This cannot be undone.", hu: "Ez nem vonható vissza." },
  "modal.resetCalendarDesc": {
    en: "Habits you've never checked off will be permanently deleted. Habits with completed check-ins are kept (so your Analytics history stays intact) but will stop appearing as upcoming. Type RESET to confirm.",
    hu: "A soha ki nem pipált szokások véglegesen törlődnek. A már teljesített check-inekkel rendelkező szokások megmaradnak (hogy az Analytics előzményeid ne vesszenek el), de a jövőben már nem jelennek meg aktívként. Írd be, hogy RESET a megerősítéshez.",
  },
  "modal.resetCalendarConfirm": { en: "Delete Everything", hu: "Minden törlése" },
  "toast.calendarReset": { en: "Calendar reset", hu: "Naptár visszaállítva" },
  "analytics.title": { en: "Analytics", hu: "Statisztika" },
  "analytics.welcomeTitle": { en: "Welcome to the Analytic Center", hu: "Üdvözlünk az Elemzőközpontban" },
  "analytics.isSaved": { en: "is saved", hu: "van megspórolva" },
  "analytics.dailyMoving": { en: "Daily moving:", hu: "Napi mozgás:" },
  "analytics.youHaveSaved": { en: "You have saved:", hu: "Megtakarítottál:" },
  "analytics.inTotal": { en: "in total", hu: "összesen" },
  "analytics.bestEarningHabit": { en: "Your best earning habit:", hu: "A legjobban kereső szokásod:" },
  "analytics.saved": { en: "saved", hu: "megspórolva" },
  "analytics.youHaveCompleted": { en: "You have completed", hu: "Teljesítettél" },
  "analytics.inThisSession": { en: "in this session", hu: "ebben a munkamenetben" },
  "analytics.top3": { en: "Top 3", hu: "Top 3" },
  "profile.email": { en: "Email", hu: "E-mail" },
  "profile.role": { en: "Role", hu: "Szerepkör" },
  "profile.roleUser": { en: "User", hu: "Felhasználó" },
  "profile.memberSince": { en: "Member since", hu: "Tag óta" },
  "profile.logout": { en: "Log Out", hu: "Kijelentkezés" },
  "profile.darkMode": { en: "Dark Mode", hu: "Sötét mód" },
  "habit.workout": { en: "Workout", hu: "Edzés" },
  "habit.read": { en: "Read", hu: "Olvasás" },
  "habit.meditate": { en: "Meditate", hu: "Meditáció" },
};

const LangContext = React.createContext({ lang: "en", setLang: () => {}, t: (k) => k });
const useLang = () => React.useContext(LangContext);
const makeT = (lang) => (key) => TRANSLATIONS[key] ? TRANSLATIONS[key][lang] : key;

const ThemeContext = React.createContext({ theme: "light", setTheme: () => {} });
const useTheme = () => React.useContext(ThemeContext);

const formatUsd = (n) => `$${(n || 0).toFixed(2)}`;
const toLocalISODate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
// The "logical day" rolls over at 02:00 local time instead of midnight, so
// e.g. Tuesday 01:30 still counts as Monday, while Tuesday 02:01 is Tuesday.
// Computed by simply subtracting 2 hours from the real current time.
const LOGICAL_DAY_ROLLOVER_HOURS = 2;
const logicalNow = () => new Date(Date.now() - LOGICAL_DAY_ROLLOVER_HOURS * 60 * 60 * 1000);
const todayStr = () => toLocalISODate(logicalNow());
const daysAgoStr = (n) => {
  const d = logicalNow();
  d.setDate(d.getDate() - n);
  return toLocalISODate(d);
};
const shiftDateStr = (iso, delta) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return toLocalISODate(d);
};
const MONTH_ABBR3 = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const monthAbbr3 = (iso) => MONTH_ABBR3[new Date(iso + "T00:00:00").getMonth()];
const WEEKDAYS = { en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], hu: ["V", "H", "K", "Sze", "Cs", "P", "Szo"] };
const dayAbbrev = (iso, lang) => WEEKDAYS[lang || "en"][new Date(iso + "T00:00:00").getDay()];
const dayNum = (iso) => new Date(iso + "T00:00:00").getDate();
const MONTHS = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  hu: ["jan.", "febr.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."],
};
const formatMemberSince = (iso, lang) => {
  const d = new Date(iso + "T00:00:00");
  if (lang === "hu") {
    return `${d.getFullYear()}. ${MONTHS.hu[d.getMonth()]} ${d.getDate()}.`;
  }
  return `${MONTHS.en[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
const formatShortDate = (iso, lang) => {
  const d = new Date(iso + "T00:00:00");
  if (lang === "hu") return `${MONTHS.hu[d.getMonth()]} ${d.getDate()}.`;
  return `${MONTHS.en[d.getMonth()]} ${d.getDate()}`;
};
const MONTHS_FULL = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  hu: ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"],
};
const formatMonthTitle = (year, month, lang) => {
  if (lang === "hu") return `${year}. ${MONTHS_FULL.hu[month]}`;
  return `${MONTHS_FULL.en[month]} ${year}`;
};

/* ---------------------------------- Toast --------------------------------- */

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  return [toast, show];
}

function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-[90%] px-4 py-3 rounded-2xl flex items-center gap-2 animate-[fadeIn_0.2s_ease] hb-glass`}
      style={{
        position: "fixed",
        background: isError ? C.destructiveMuted : C.card,
        color: isError ? C.destructive : C.foreground,
        ...body,
      }}
    >
      {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} color={C.primary} />}
      <span className="text-sm">{toast.message}</span>
    </div>
  );
}

/* ------------------------------- Auth screens ------------------------------ */

function AuthShell({ children }) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-6"
      style={{ color: C.foreground, ...body }}
    >
      <style>{FONT_IMPORT}</style>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex flex-col items-center mb-8">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 hb-glass"
      >
        <Landmark size={26} color={C.primary} />
      </div>
      <h1 className="text-3xl tracking-wide" style={heading}>
        HabitBank
      </h1>
    </div>
  );
}

function TextField({ label, icon, ...props }) {
  return (
    <div className="mb-4">
      <label className="text-xs font-medium mb-1.5 block" style={{ color: C.mutedForeground }}>
        {label}
      </label>
      <div className="flex items-center gap-2 px-3.5 rounded-xl h-12 hb-glass">
        {icon}
        <input
          {...props}
          className="w-full h-full bg-transparent outline-none text-sm"
          style={{ color: C.foreground, ...body }}
        />
      </div>
    </div>
  );
}

function GoogleButton({ onClick }) {
  const { t } = useLang();
  return (
    <button
      onClick={onClick}
      className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-opacity active:opacity-70 hb-glass"
      style={{ color: C.foreground }}
    >
      <svg width="16" height="16" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.4 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.4 29.6 3 24 3 16.2 3 9.5 7.4 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14-5.1l-6.5-5.4C29.6 36.6 27 37.5 24 37.5c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.4 40.6 16.1 45 24 45z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.5 5.4C41.4 35.9 44 30.5 44 24c0-1.4-.1-2.7-.4-3.5z" />
      </svg>
      {t("auth.continueGoogle")}
    </button>
  );
}

function LoginPage({ goto, showToast }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) showToast(error.message, "error");
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  };

  return (
    <AuthShell>
      <BrandMark />
      <TextField
        label={t("auth.email")}
        icon={<Mail size={15} color={C.mutedForeground} />}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <TextField
        label={t("auth.password")}
        icon={<KeyRound size={15} color={C.mutedForeground} />}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      <div className="flex justify-end mb-5">
        <button
          onClick={() => goto("forgot-password")}
          className="text-xs font-medium active:opacity-60"
          style={{ color: C.primary }}
        >
          {t("auth.forgotPassword")}
        </button>
      </div>
      <button
        onClick={submit}
        disabled={busy}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium mb-3 transition-opacity active:opacity-70 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: "transparent", color: C.foreground }}
      >
        {busy && <Loader2 size={15} className="animate-spin" />}
        {busy ? t("auth.loggingIn") : t("auth.logIn")}
      </button>
      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1" style={{ background: C.border }} />
        <span className="text-xs" style={{ color: C.mutedForeground }}>
          {t("auth.or")}
        </span>
        <div className="h-px flex-1" style={{ background: C.border }} />
      </div>
      <GoogleButton onClick={handleGoogle} />
      <p className="text-center text-sm mt-6" style={{ color: C.mutedForeground }}>
        {t("auth.noAccount")}{" "}
        <button onClick={() => goto("register")} className="font-medium" style={{ color: C.primary }}>
          {t("auth.register")}
        </button>
      </p>
    </AuthShell>
  );
}

function RegisterPage({ goto, showToast }) {
  const { t } = useLang();
  const [step, setStep] = useState("form"); // form | sent
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submitForm = async () => {
    if (!email || !password) return;
    setBusy(true);
    const namePart = email.split("@")[0];
    const full_name = namePart ? namePart.charAt(0).toUpperCase() + namePart.slice(1) : "User";
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name }, emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    if (!data.session) setStep("sent");
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  };

  if (step === "sent") {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${C.secondary}33` }}>
            <Mail size={24} color={C.foreground} />
          </div>
          <h2 className="text-2xl tracking-wide mb-2" style={heading}>
            {t("forgot.checkInbox")}
          </h2>
          <p className="text-sm mb-8" style={{ color: C.mutedForeground }}>
            {t("forgot.sentDesc")} <span style={{ color: C.foreground }}>{email || t("auth.otpFallback")}</span>.
          </p>
          <button
            onClick={() => goto("login")}
            className="hb-glass w-full h-12 rounded-xl text-sm font-medium"
            style={{ background: "transparent", color: C.foreground }}
          >
            {t("forgot.backToLogin")}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <BrandMark />
      <TextField
        label={t("auth.email")}
        icon={<Mail size={15} color={C.mutedForeground} />}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <TextField
        label={t("auth.password")}
        icon={<KeyRound size={15} color={C.mutedForeground} />}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      <button
        onClick={submitForm}
        disabled={busy}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium mb-3 mt-1 transition-opacity active:opacity-70 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: "transparent", color: C.foreground }}
      >
        {busy && <Loader2 size={15} className="animate-spin" />}
        {busy ? t("auth.creatingAccount") : t("auth.register")}
      </button>
      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1" style={{ background: C.border }} />
        <span className="text-xs" style={{ color: C.mutedForeground }}>
          {t("auth.or")}
        </span>
        <div className="h-px flex-1" style={{ background: C.border }} />
      </div>
      <GoogleButton onClick={handleGoogle} />
      <p className="text-center text-sm mt-6" style={{ color: C.mutedForeground }}>
        {t("auth.alreadyHaveAccount")}{" "}
        <button onClick={() => goto("login")} className="font-medium" style={{ color: C.primary }}>
          {t("auth.logIn")}
        </button>
      </p>
    </AuthShell>
  );
}

function ForgotPasswordPage({ goto, showToast }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email) return;
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setBusy(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${C.secondary}33` }}>
            <Mail size={24} color={C.foreground} />
          </div>
          <h2 className="text-2xl tracking-wide mb-2" style={heading}>
            {t("forgot.checkInbox")}
          </h2>
          <p className="text-sm mb-8" style={{ color: C.mutedForeground }}>
            {t("forgot.sentDesc")} <span style={{ color: C.foreground }}>{email || t("auth.otpFallback")}</span>.
          </p>
          <button onClick={() => goto("login")} className="text-sm font-medium" style={{ color: C.mutedForeground }}>
            {t("forgot.backToLogin")}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <button onClick={() => goto("login")} className="flex items-center gap-1.5 text-xs mb-6 active:opacity-60" style={{ color: C.mutedForeground }}>
        <ArrowLeft size={14} />
        {t("auth.back")}
      </button>
      <h2 className="text-2xl tracking-wide mb-1" style={heading}>
        {t("forgot.title")}
      </h2>
      <p className="text-sm mb-6" style={{ color: C.mutedForeground }}>
        {t("forgot.desc")}
      </p>
      <TextField
        label={t("auth.email")}
        icon={<Mail size={15} color={C.mutedForeground} />}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <button
        onClick={submit}
        disabled={busy}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium transition-opacity active:opacity-70 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: "transparent", color: C.foreground }}
      >
        {busy && <Loader2 size={15} className="animate-spin" />}
        {t("forgot.sendLink")}
      </button>
    </AuthShell>
  );
}

function ResetPasswordPage({ goto, showToast }) {
  const { t } = useLang();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!password || password !== confirm) {
      showToast(t("reset.confirmPassword"), "error");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) await supabase.auth.signOut();
    setBusy(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast(t("toast.passwordUpdated"));
    goto("login");
  };

  return (
    <AuthShell>
      <h2 className="text-2xl tracking-wide mb-1" style={heading}>
        {t("reset.title")}
      </h2>
      <p className="text-sm mb-6" style={{ color: C.mutedForeground }}>
        {t("reset.desc")}
      </p>
      <TextField
        label={t("reset.newPassword")}
        icon={<KeyRound size={15} color={C.mutedForeground} />}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      <TextField
        label={t("reset.confirmPassword")}
        icon={<KeyRound size={15} color={C.mutedForeground} />}
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="••••••••"
      />
      <button
        onClick={submit}
        disabled={busy}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium transition-opacity active:opacity-70 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: "transparent", color: C.foreground }}
      >
        {busy && <Loader2 size={15} className="animate-spin" />}
        {busy ? t("reset.saving") : t("reset.resetPassword")}
      </button>
    </AuthShell>
  );
}

/* ------------------------------- Bottom nav -------------------------------- */

function BottomNav({ tab, setTab }) {
  const { t } = useLang();
  const items = [
    { key: "home", label: t("nav.home"), icon: Home },
    { key: "analytics", label: t("nav.analytics"), icon: BarChart3 },
    { key: "calendar", label: t("nav.habitCalendar"), icon: CalendarDays },
  ];
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-16 z-40 hb-glass"
      style={{
        position: "fixed",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div className="max-w-lg mx-auto h-full flex items-stretch">
        {items.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 flex flex-col items-center justify-center gap-1 active:opacity-70"
            >
              <Icon size={20} color={active ? C.primary : C.mutedForeground} />
              <span className="text-[10px] font-medium" style={{ color: active ? C.primary : C.mutedForeground, ...body }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------- Header ---------------------------------- */

function Header({ streak, onProfileClick }) {
  return (
    <div className="flex items-center justify-between py-4">
      <button
        onClick={onProfileClick}
        className="w-9 h-9 rounded-lg flex items-center justify-center hb-glass active:opacity-70"
      >
        <User size={17} color={C.foreground} />
      </button>
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hb-glass"
      >
        <Flame size={14} color={C.foreground} />
        <span className="text-xs font-semibold" style={{ color: C.foreground, ...mono }}>
          {streak}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------- Balance card ------------------------------- */

function BalanceCard({ locked, withdrawable, onTopUp, onWithdraw, onUnlock }) {
  const { t } = useLang();
  const pool = locked + withdrawable;
  const percent = pool > 0 ? Math.min(100, Math.round((withdrawable / pool) * 100)) : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center text-center py-3">
        <span className="text-sm" style={{ color: C.mutedForeground, ...body }}>
          {t("balance.savedLabel")}
        </span>
        <div className="mt-1.5">
          <span className="text-5xl font-bold" style={{ ...mono, color: C.foreground }}>
            {formatUsd(withdrawable)}
          </span>
        </div>
        <span className="text-sm mt-1" style={{ color: C.mutedForeground, ...body }}>
          {t("balance.savedSubtitle")}
        </span>
        <button
          onClick={onWithdraw}
          className="mt-4 px-7 py-2.5 rounded-full text-sm font-semibold transition-opacity active:opacity-80"
          style={{ background: "transparent", color: C.foreground, border: `1px solid ${C.border}` }}
        >
          {t("balance.withdraw")}
        </button>
      </div>

      <div className="rounded-2xl p-5 hb-glass">
        <div className="flex items-center gap-1.5 mb-2">
          <Lock size={13} color={C.mutedForeground} />
          <span className="text-xs uppercase font-semibold" style={{ color: C.mutedForeground, letterSpacing: "0.04em" }}>
            {t("balance.locked")}:
          </span>
        </div>
        <div className="mb-3">
          <span className="text-3xl font-bold" style={{ ...mono, color: C.foreground }}>
            {formatUsd(locked)}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: C.muted }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percent}%`, background: C.primary }}
          />
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onTopUp}
            className="flex-1 h-10 rounded-full text-sm font-semibold transition-opacity active:opacity-80"
            style={{ background: "transparent", color: C.foreground, border: `1px solid ${C.border}` }}
          >
            {t("balance.invest")}
          </button>
          <button
            onClick={onUnlock}
            className="flex-1 h-10 rounded-full text-sm font-semibold transition-opacity active:opacity-80"
            style={{ background: "transparent", color: C.foreground, border: `1px solid ${C.border}` }}
          >
            {t("balance.unlock")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Habit check item ----------------------------- */

function HabitCheckItem({ habit, checked, disabled, locked, loading, onToggle }) {
  const { t } = useLang();
  const displayName = habit.nameKey ? t(habit.nameKey) : habit.name;
  const rowTextColor = C.foreground;
  const nonInteractive = locked || (disabled && !checked) || loading;
  return (
    <button
      onClick={() => !nonInteractive && onToggle(habit)}
      disabled={nonInteractive}
      className={`w-full flex items-center justify-between rounded-3xl px-4 py-4 ${checked ? "" : "hb-glass"} ${locked ? "cursor-not-allowed" : "transition-all"}`}
      style={{
        background: checked ? C.secondary : C.card,
        opacity: locked ? 0.55 : disabled && !checked ? 0.45 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2"
          style={{
            background: checked ? C.primary : "transparent",
            borderColor: checked ? C.primary : C.border,
          }}
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" color={checked ? C.primaryForeground : C.mutedForeground} />
          ) : (
            checked && <Check size={14} color={C.primaryForeground} strokeWidth={3} />
          )}
        </div>
        <span className="text-sm font-semibold" style={{ color: rowTextColor, ...body }}>
          {displayName}
        </span>
        {locked && <Lock size={12} color={C.mutedForeground} />}
      </div>
      <span
        className="text-xs font-semibold px-3 py-1.5 rounded-full"
        style={{ ...mono, color: C.foreground, background: C.muted }}
      >
        {formatUsd(habit.value_usd)}
      </span>
    </button>
  );
}

/* --------------------------------- Week strip -------------------------------- */

function WeekStrip({ checkins, selectedDate, onSelect }) {
  const { lang } = useLang();
  const daysWithCheckin = useMemo(() => new Set(checkins.map((c) => c.completed_date)), [checkins]);
  const today = todayStr();
  const days = [];
  for (let i = -3; i <= 3; i++) days.push(shiftDateStr(today, i));

  return (
    <div className="flex items-center justify-between gap-1.5">
      {days.map((iso) => {
        const done = daysWithCheckin.has(iso);
        const isToday = iso === today;
        const isFuture = iso > today;
        const isSelected = iso === selectedDate;
        const clickable = !isFuture;

        let bg;
        let textColor;
        if (done) {
          bg = C.primary;
          textColor = C.primaryForeground;
        } else if (isToday) {
          bg = C.secondary;
          textColor = C.foreground;
        } else if (isFuture) {
          bg = C.muted;
          textColor = C.foreground;
        } else {
          bg = C.card;
          textColor = C.mutedForeground;
        }

        return (
          <button
            key={iso}
            onClick={() => clickable && onSelect(iso)}
            disabled={!clickable}
            className={`flex-1 flex flex-col items-center gap-1 ${clickable ? "active:opacity-70" : "cursor-default"}`}
          >
            <span className="text-[10px] font-medium" style={{ color: C.mutedForeground }}>
              {dayAbbrev(iso, lang)}
            </span>
            <div
              className="w-9 h-10 rounded-lg flex flex-col items-center justify-center leading-none border-2 py-1"
              style={{
                background: bg,
                color: textColor,
                borderColor: isSelected ? C.foreground : isToday ? `${C.primary}66` : "transparent",
                ...mono,
              }}
            >
              <span className="text-xs" style={{ fontWeight: done || isToday ? 700 : 500 }}>
                {dayNum(iso)}
              </span>
              <span className="text-[8px] mt-0.5" style={{ opacity: 0.75, fontWeight: 500 }}>
                {monthAbbr3(iso)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------ Add habits box -------------------------------- */

function AddHabitCard({ onClick }) {
  const { t } = useLang();
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 rounded-3xl px-4 py-4 transition-opacity active:opacity-70"
      style={{ border: `1.5px dashed ${C.border}`, background: C.muted }}
    >
      <Plus size={16} color={C.mutedForeground} />
      <span className="text-sm font-semibold" style={{ color: C.mutedForeground, ...body }}>
        {t("home.addHabit")}
      </span>
    </button>
  );
}

function AddHabitsBox({ isToday, dateLabel, onClick }) {
  const { t } = useLang();
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl py-14 flex flex-col items-center justify-center gap-4 text-center transition-opacity active:opacity-70"
      style={{ border: `1.5px dashed ${C.border}` }}
    >
      <span className="text-sm font-semibold" style={{ color: C.foreground, ...body }}>
        {isToday ? t("home.addHabitsToday") : `${t("home.addHabitsFor")} ${dateLabel}`}
      </span>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center border-2"
        style={{ borderColor: C.border }}
      >
        <Plus size={18} color={C.foreground} />
      </div>
    </button>
  );
}

/* ---------------------------------- Modals ----------------------------------- */

function ModalBase({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 pb-7 sm:pb-5 hb-glass"
        style={{ ...body, color: C.foreground }}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-xl tracking-wide" style={heading}>
        {title}
      </span>
      <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center active:opacity-60 hb-glass">
        <X size={16} color={C.mutedForeground} />
      </button>
    </div>
  );
}

function TopUpModal({ onClose, onConfirm }) {
  const { t } = useLang();
  const [amount, setAmount] = useState("");
  const chips = [1000, 5000, 10000, 25000, 50000];

  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={t("balance.topUp")} onClose={onClose} />
      <label className="text-xs font-medium mb-1.5 block" style={{ color: C.mutedForeground }}>
        {t("modal.amount")}
      </label>
      <input
        autoFocus
        type="number"
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="10000"
        className="w-full h-12 px-3.5 rounded-xl outline-none text-lg mb-3 hb-glass"
        style={{ color: C.foreground, ...mono }}
      />
      <div className="flex flex-wrap gap-2 mb-5">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setAmount(String(c))}
            className="hb-glass px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "transparent", color: C.foreground, ...mono }}
          >
            {formatUsd(c)}
          </button>
        ))}
      </div>
      <button
        onClick={() => amount && Number(amount) > 0 && onConfirm(Number(amount))}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium transition-opacity active:opacity-80"
        style={{ background: "transparent", color: C.foreground }}
      >
        {t("modal.confirmTopUp")}
      </button>
    </ModalBase>
  );
}

function WithdrawModal({ withdrawable, onClose, onConfirm }) {
  const { t } = useLang();
  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={t("balance.withdraw")} onClose={onClose} />
      <p className="text-sm mb-1" style={{ color: C.mutedForeground }}>
        {t("modal.withdrawableAmount")}
      </p>
      <div className="mb-5">
        <span className="text-3xl font-bold" style={{ ...mono, color: C.primary }}>
          {formatUsd(withdrawable)}
        </span>
      </div>
      <button
        onClick={onConfirm}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium transition-opacity active:opacity-80"
        style={{ background: "transparent", color: C.foreground }}
      >
        {t("modal.confirmWithdraw")}
      </button>
    </ModalBase>
  );
}

function UnlockModal({ locked, onClose, onConfirm }) {
  const { t } = useLang();
  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={t("modal.unlockTitle")} onClose={onClose} />
      <p className="text-sm mb-1" style={{ color: C.mutedForeground }}>
        {t("balance.locked")}
      </p>
      <div className="mb-3">
        <span className="text-3xl font-bold" style={{ ...mono, color: C.primary }}>
          {formatUsd(locked)}
        </span>
      </div>
      <p className="text-xs mb-5" style={{ color: C.mutedForeground }}>
        {t("modal.unlockDesc")}
      </p>
      <button
        onClick={onConfirm}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium transition-opacity active:opacity-80"
        style={{ background: "transparent", color: C.foreground }}
      >
        {t("modal.confirmUnlock")}
      </button>
    </ModalBase>
  );
}

function FrequencyOption({ selected, onClick, icon: Icon, label, desc }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 rounded-2xl hb-glass transition-opacity active:opacity-80 flex items-center gap-3"
      style={{
        background: selected ? C.secondary : "transparent",
        border: selected ? `1px solid ${C.primary}` : "1px solid transparent",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: selected ? C.primary : C.secondary }}
      >
        <Icon size={16} color={selected ? C.primaryForeground : C.foreground} />
      </div>
      <div>
        <div className="text-sm font-semibold" style={{ color: C.foreground }}>
          {label}
        </div>
        <div className="text-xs mt-0.5" style={{ color: C.mutedForeground }}>
          {desc}
        </div>
      </div>
    </button>
  );
}

function AddHabitForm({ onClose, onConfirm }) {
  const { t, lang } = useLang();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [frequency, setFrequency] = useState("daily"); // daily | date | weekly
  const [exactDate, setExactDate] = useState(todayStr());
  const [selectedWeekdays, setSelectedWeekdays] = useState(new Set());
  const [error, setError] = useState("");

  const toggleWeekday = (day) => {
    setSelectedWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const submit = () => {
    if (!name.trim() || !(Number(value) > 0)) return;
    setError("");
    if (frequency === "daily") {
      onConfirm({ type: "daily", name: name.trim(), value_usd: Number(value) });
    } else if (frequency === "date") {
      onConfirm({ type: "custom", name: name.trim(), value_usd: Number(value), scheduledDates: [exactDate] });
    } else {
      if (selectedWeekdays.size === 0) {
        setError(t("modal.noWeekdaysSelected"));
        return;
      }
      onConfirm({
        type: "weekly",
        name: name.trim(),
        value_usd: Number(value),
        weekdays: Array.from(selectedWeekdays),
      });
    }
  };

  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={t("modal.addHabitTitle")} onClose={onClose} />
      <label className="text-xs font-medium mb-1.5 block" style={{ color: C.mutedForeground }}>
        {t("modal.name")}
      </label>
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("modal.namePlaceholder")}
        className="w-full h-12 px-3.5 rounded-xl outline-none text-sm mb-3 hb-glass"
        style={{ color: C.foreground, ...body }}
      />
      <label className="text-xs font-medium mb-1.5 block" style={{ color: C.mutedForeground }}>
        {t("modal.valuePerCompletion")}
      </label>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="500"
        className="w-full h-12 px-3.5 rounded-xl outline-none text-sm mb-4 hb-glass"
        style={{ color: C.foreground, ...mono }}
      />

      <label className="text-xs font-medium mb-1.5 block" style={{ color: C.mutedForeground }}>
        {t("modal.frequency")}
      </label>
      <div className="space-y-2 mb-4">
        <FrequencyOption
          selected={frequency === "daily"}
          onClick={() => setFrequency("daily")}
          icon={Flame}
          label={t("habitType.daily")}
          desc={t("habitType.dailyDesc")}
        />
        <FrequencyOption
          selected={frequency === "date"}
          onClick={() => setFrequency("date")}
          icon={CalendarDays}
          label={t("modal.exactDate")}
          desc={t("modal.exactDateDesc")}
        />
        <FrequencyOption
          selected={frequency === "weekly"}
          onClick={() => setFrequency("weekly")}
          icon={Repeat}
          label={t("modal.customRecurrence")}
          desc={t("modal.customRecurrenceDesc")}
        />
      </div>

      {frequency === "date" && (
        <input
          type="date"
          value={exactDate}
          min={todayStr()}
          onChange={(e) => setExactDate(e.target.value)}
          className="w-full h-12 px-3.5 rounded-xl outline-none text-sm mb-4 hb-glass"
          style={{ color: C.foreground, colorScheme: theme, ...mono }}
        />
      )}

      {frequency === "weekly" && (
        <div className="flex items-center justify-between gap-1 mb-4">
          {WEEKDAYS[lang].map((label, idx) => {
            const selected = selectedWeekdays.has(idx);
            return (
              <button
                key={idx}
                onClick={() => toggleWeekday(idx)}
                className="flex-1 aspect-square rounded-lg flex items-center justify-center text-xs"
                style={{
                  background: selected ? C.primary : C.muted,
                  color: selected ? C.primaryForeground : C.foreground,
                  fontWeight: selected ? 600 : 400,
                  ...mono,
                }}
              >
                {label[0]}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-xs mb-3" style={{ color: C.destructive }}>
          {error}
        </p>
      )}

      <button
        onClick={submit}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium transition-opacity active:opacity-80"
        style={{ background: "transparent", color: C.foreground }}
      >
        {t("modal.createHabit")}
      </button>
    </ModalBase>
  );
}

/* ------------------------------ Manage habits ---------------------------------- */

function ManageHabitRow({ habit, onRename, onValueChange, onRequestDelete }) {
  const { t } = useLang();
  return (
    <div className="flex items-center gap-2 rounded-2xl px-3 py-2.5 hb-glass">
      <input
        type="text"
        value={habit.name}
        onChange={(e) => onRename(habit.id, e.target.value)}
        className="flex-1 min-w-0 bg-transparent outline-none text-sm font-medium"
        style={{ color: C.foreground, ...body }}
      />
      <span className="text-xs shrink-0" style={{ color: C.mutedForeground, ...mono }}>
        $
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={habit.value_usd}
        onChange={(e) => onValueChange(habit.id, Number(e.target.value) || 0)}
        className="w-20 bg-transparent outline-none text-sm text-right rounded-lg px-2 py-1"
        style={{ color: C.foreground, background: C.muted, ...mono }}
      />
      <button
        onClick={() => onRequestDelete(habit)}
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 active:opacity-60"
        style={{ background: C.destructiveMuted }}
      >
        <Trash2 size={14} color={C.destructive} />
      </button>
    </div>
  );
}

function LockedManageHabitRow({ habit }) {
  const { t } = useLang();
  const displayName = habit.nameKey ? t(habit.nameKey) : habit.name;
  return (
    <div
      className="flex items-center gap-2 rounded-2xl px-3 py-2.5 hb-glass"
      style={{ opacity: 0.55, cursor: "not-allowed" }}
    >
      <span className="flex-1 min-w-0 truncate text-sm font-medium" style={{ color: C.foreground, ...body }}>
        {displayName}
      </span>
      <span
        className="w-20 text-sm text-right rounded-lg px-2 py-1"
        style={{ color: C.foreground, background: C.muted, ...mono }}
      >
        {formatUsd(habit.value_usd)}
      </span>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
        <Lock size={14} color={C.mutedForeground} />
      </div>
    </div>
  );
}

function ConfirmDeleteHabitModal({ habitName, onClose, onConfirm }) {
  const { t } = useLang();
  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={t("modal.confirmDeleteHabitTitle")} onClose={onClose} />
      <p className="text-sm mb-1" style={{ color: C.foreground, ...body }}>
        {habitName}
      </p>
      <p className="text-xs mb-5" style={{ color: C.mutedForeground }}>
        {t("modal.confirmDeleteHabitDesc")}
      </p>
      <div className="flex gap-2.5">
        <button
          onClick={onClose}
          className="flex-1 h-11 rounded-xl text-sm font-semibold hb-glass transition-opacity active:opacity-80"
          style={{ color: C.foreground }}
        >
          {t("modal.cancel")}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 h-11 rounded-xl text-sm font-semibold transition-opacity active:opacity-80"
          style={{ background: C.destructive, color: C.destructiveForeground }}
        >
          {t("modal.delete")}
        </button>
      </div>
    </ModalBase>
  );
}

function ManageHabitsModal({ habits, onClose, onSaveChanges, onDeleteHabit, onAddNew }) {
  const { t } = useLang();
  const [draftHabits, setDraftHabits] = useState(() => habits.map((h) => ({ ...h })));
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleRename = (id, name) => {
    setDraftHabits((prev) => prev.map((h) => (h.id === id ? { ...h, name } : h)));
  };
  const handleValueChange = (id, value_usd) => {
    setDraftHabits((prev) => prev.map((h) => (h.id === id ? { ...h, value_usd } : h)));
  };

  // Deletion is only queued here; nothing is persisted until Save.
  const handleConfirmDelete = () => {
    const id = pendingDelete.id;
    setPendingDelete(null);
    setDraftHabits((prev) => prev.filter((h) => h.id !== id));
    setPendingDeleteIds((prev) => [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    if (pendingDeleteIds.length > 0) {
      await Promise.all(pendingDeleteIds.map((id) => onDeleteHabit(id)));
    }
    const changed = draftHabits.filter((d) => {
      const original = habits.find((h) => h.id === d.id);
      return (
        original &&
        (original.name !== d.name || original.value_usd !== d.value_usd) &&
        d.name.trim() &&
        d.value_usd > 0
      );
    });
    if (changed.length > 0) await onSaveChanges(changed);
    setSaving(false);
    onClose();
  };

  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={t("modal.manageHabitsTitle")} onClose={onClose} />
      {draftHabits.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: C.mutedForeground }}>
          {t("home.noHabits")}
        </p>
      ) : (
        <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto">
          {draftHabits.map((h) => (
            <ManageHabitRow
              key={h.id}
              habit={h}
              onRename={handleRename}
              onValueChange={handleValueChange}
              onRequestDelete={setPendingDelete}
            />
          ))}
        </div>
      )}
      <button
        onClick={onAddNew}
        className="w-full flex items-center justify-center gap-1.5 text-sm font-medium py-3 rounded-xl mb-3 hb-glass active:opacity-80"
        style={{ color: C.foreground }}
      >
        <Plus size={14} />
        {t("modal.addNewHabitRow")}
      </button>
      <div className="flex gap-2.5">
        <button
          onClick={onClose}
          className="flex-1 h-11 rounded-xl text-sm font-semibold hb-glass transition-opacity active:opacity-80"
          style={{ color: C.foreground }}
        >
          {t("modal.cancel")}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 h-11 rounded-xl text-sm font-semibold transition-opacity active:opacity-80 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: "transparent", color: C.foreground, border: `1px solid ${C.border}` }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {t("modal.save")}
        </button>
      </div>
      {pendingDelete && (
        <ConfirmDeleteHabitModal
          habitName={pendingDelete.nameKey ? t(pendingDelete.nameKey) : pendingDelete.name}
          onClose={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </ModalBase>
  );
}

/* ---------------------------- Daily summary row -------------------------------- */

function DailySummaryRow({ savedAmount, onManage }) {
  const { t } = useLang();
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <span className="text-[11px] uppercase font-semibold block" style={{ color: C.mutedForeground, letterSpacing: "0.04em" }}>
          {t("home.dailySavedLabel")}
        </span>
        <span className="text-base font-bold" style={{ ...mono, color: C.foreground }}>
          {formatUsd(savedAmount)}
        </span>
      </div>
      <button
        onClick={onManage}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full hb-glass active:opacity-80"
        style={{ color: C.foreground }}
      >
        <SlidersHorizontal size={13} />
        {t("home.manageHabits")}
      </button>
    </div>
  );
}

/* ------------------------------ Confirm uncheck --------------------------------- */

function ConfirmUncheckModal({ habit, onClose, onConfirm }) {
  const { t } = useLang();
  const displayName = habit.nameKey ? t(habit.nameKey) : habit.name;
  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={t("modal.confirmUncheckTitle")} onClose={onClose} />
      <p className="text-sm mb-1" style={{ color: C.foreground, ...body }}>
        {displayName}
      </p>
      <p className="text-xs mb-5" style={{ color: C.mutedForeground }}>
        {t("modal.confirmUncheckDesc")}
      </p>
      <div className="flex gap-2.5">
        <button
          onClick={onClose}
          className="flex-1 h-11 rounded-xl text-sm font-semibold hb-glass transition-opacity active:opacity-80"
          style={{ color: C.foreground }}
        >
          {t("modal.cancel")}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 h-11 rounded-xl text-sm font-semibold transition-opacity active:opacity-80"
          style={{ background: "transparent", color: C.foreground, border: `1px solid ${C.border}` }}
        >
          {t("modal.confirm")}
        </button>
      </div>
    </ModalBase>
  );
}

function ConfirmPastCheckinModal({ habit, onClose, onConfirm }) {
  const { t } = useLang();
  const displayName = habit.nameKey ? t(habit.nameKey) : habit.name;
  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={displayName} onClose={onClose} />
      <p className="text-sm mb-5" style={{ color: C.mutedForeground, ...body }}>
        {t("modal.confirmPastCheckinDesc")}
      </p>
      <div className="flex gap-2.5">
        <button
          onClick={onClose}
          className="flex-1 h-11 rounded-xl text-sm font-semibold hb-glass transition-opacity active:opacity-80"
          style={{ color: C.foreground }}
        >
          {t("modal.cancelPastCheckin")}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 h-11 rounded-xl text-sm font-semibold transition-opacity active:opacity-80"
          style={{ background: C.primary, color: C.primaryForeground }}
        >
          {t("modal.confirmPastCheckin")}
        </button>
      </div>
    </ModalBase>
  );
}

/* ------------------------------ Add-habit flow (shared) ------------------------- */

function useAddHabitFlow(user, setHabits, showToast) {
  const { t } = useLang();
  const [showForm, setShowForm] = useState(false);

  const handleCreateHabit = async ({ type, name, value_usd, scheduledDates, weekdays }) => {
    setShowForm(false);
    try {
      let habit;
      if (type === "daily") {
        habit = await addDailyHabit(user.id, name, value_usd);
      } else if (type === "custom") {
        habit = await addCustomHabit(user.id, name, value_usd, scheduledDates);
      } else {
        habit = await addWeeklyHabit(user.id, name, value_usd, weekdays);
      }
      setHabits((prev) => [...prev, habit]);
      showToast(t("toast.habitCreated"));
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return { showForm, setShowForm, handleCreateHabit };
}

/* ---------------------------------- Home page --------------------------------- */

function HomePage({ user, setTab, habits, setHabits, checkins, setCheckins, balance, setBalance, showToast }) {
  const { t, lang } = useLang();
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const addFlow = useAddHabitFlow(user, setHabits, showToast);
  const [showManage, setShowManage] = useState(false);
  const [pendingUncheck, setPendingUncheck] = useState(null);
  const [pendingPastCheckin, setPendingPastCheckin] = useState(null);
  const [checkingId, setCheckingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const today = todayStr();
  const activeHabits = habitsForDate(habits, selectedDate);
  const checkinsOnSelected = useMemo(
    () => checkins.filter((c) => c.completed_date === selectedDate),
    [checkins, selectedDate]
  );
  const checkinsSelected = useMemo(
    () => new Set(checkinsOnSelected.map((c) => c.habit_id)),
    [checkinsOnSelected]
  );
  const isWithdrawLocked = (habitId) => {
    if (!balance.withdrawn_at) return false;
    const c = checkinsOnSelected.find((c) => c.habit_id === habitId);
    return !!c && !!c.created_at && c.created_at <= balance.withdrawn_at;
  };

  const savedToday = useMemo(() => {
    const valueByHabit = new Map(habits.map((h) => [h.id, h.value_usd]));
    return checkins
      .filter((c) => c.completed_date === selectedDate)
      .reduce((sum, c) => sum + (valueByHabit.get(c.habit_id) || 0), 0);
  }, [checkins, habits, selectedDate]);

  const streak = useMemo(() => {
    const daysWithCheckin = new Set(checkins.map((c) => c.completed_date));
    let count = 0;
    let cursor = daysWithCheckin.has(daysAgoStr(0)) ? 0 : 1;
    while (daysWithCheckin.has(daysAgoStr(cursor))) {
      count += 1;
      cursor += 1;
    }
    return count;
  }, [checkins]);

  const handleTopUp = async (amount) => {
    const next = { locked_amount: balance.locked_amount + amount, withdrawable_amount: balance.withdrawable_amount };
    setShowTopUp(false);
    try {
      await setBalanceAmounts(user.id, next.locked_amount, next.withdrawable_amount);
      setBalance((prev) => ({ ...prev, ...next }));
      showToast(`+${formatUsd(amount)} ${t("toast.topUpSuffix")}`);
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleWithdraw = async () => {
    setShowWithdraw(false);
    try {
      const withdrawn_at = await withdrawBalance(user.id, balance.locked_amount);
      setBalance({ locked_amount: balance.locked_amount, withdrawable_amount: 0, withdrawn_at });
      showToast(t("toast.withdrawComplete"));
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleUnlock = async () => {
    const next = { locked_amount: 0, withdrawable_amount: balance.withdrawable_amount + balance.locked_amount };
    setShowUnlock(false);
    try {
      await setBalanceAmounts(user.id, next.locked_amount, next.withdrawable_amount);
      setBalance((prev) => ({ ...prev, ...next }));
      showToast(t("toast.withdrawComplete"));
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleSaveHabitChanges = async (changedHabits) => {
    if (changedHabits.length === 0) return;
    try {
      await Promise.all(changedHabits.map((h) => updateHabit(h.id, { name: h.name, value_usd: h.value_usd })));
      setHabits((prev) =>
        prev.map((h) => {
          const changed = changedHabits.find((c) => c.id === h.id);
          return changed ? { ...h, name: changed.name, value_usd: changed.value_usd } : h;
        })
      );
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      await deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setCheckins((prev) => prev.filter((c) => c.habit_id !== id));
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const performUncheck = async (habit) => {
    setCheckingId(habit.id);
    const next = {
      locked_amount: balance.locked_amount + habit.value_usd,
      withdrawable_amount: Math.max(0, balance.withdrawable_amount - habit.value_usd),
    };
    try {
      await removeCheckin(habit.id, selectedDate);
      await setBalanceAmounts(user.id, next.locked_amount, next.withdrawable_amount);
      setBalance((prev) => ({ ...prev, ...next }));
      setCheckins((prev) => prev.filter((c) => !(c.habit_id === habit.id && c.completed_date === selectedDate)));
      showToast(`${formatUsd(habit.value_usd)} ${t("toast.movedBackSuffix")}`);
    } catch (e) {
      showToast(e.message, "error");
    }
    setCheckingId(null);
  };

  const performCheckin = async (habit) => {
    setCheckingId(habit.id);
    const next = {
      locked_amount: balance.locked_amount - habit.value_usd,
      withdrawable_amount: balance.withdrawable_amount + habit.value_usd,
    };
    try {
      const checkin = await addCheckin(user.id, habit.id, selectedDate);
      await setBalanceAmounts(user.id, next.locked_amount, next.withdrawable_amount);
      setBalance((prev) => ({ ...prev, ...next }));
      setCheckins((prev) => [
        ...prev,
        { id: checkin.id, habit_id: habit.id, completed_date: selectedDate, created_at: checkin.created_at },
      ]);
      showToast(`+${formatUsd(habit.value_usd)} ${t("toast.earnedSuffix")}`);
    } catch (e) {
      showToast(e.message, "error");
    }
    setCheckingId(null);
  };

  const handleToggle = async (habit) => {
    const isChecked = checkinsSelected.has(habit.id);
    const isPast = selectedDate < today;

    if (isChecked) {
      if (isPast || isWithdrawLocked(habit.id)) return; // locked: can't be modified
      setPendingUncheck(habit);
      return;
    }

    if (balance.locked_amount < habit.value_usd) {
      showToast(t("toast.insufficientBalance"), "error");
      return;
    }

    if (isPast) {
      setPendingPastCheckin(habit);
      return;
    }

    await performCheckin(habit);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-20">
      <Header streak={streak} onProfileClick={() => setTab("profile")} />

      <BalanceCard
        locked={balance.locked_amount}
        withdrawable={balance.withdrawable_amount}
        onTopUp={() => setShowTopUp(true)}
        onWithdraw={() => setShowWithdraw(true)}
        onUnlock={() => setShowUnlock(true)}
      />

      <div className="text-center mt-5 mb-3">
        <span className="text-base font-bold" style={{ ...body, color: C.foreground }}>
          {selectedDate === today ? t("home.todaysHabits") : `${t("home.habitsFor")} ${formatShortDate(selectedDate, lang)}`}
        </span>
      </div>

      <div className="rounded-2xl p-4 mb-4 hb-glass">
        <WeekStrip checkins={checkins} selectedDate={selectedDate} onSelect={setSelectedDate} />
      </div>

      {selectedDate !== today && (
        <div className="flex justify-center">
          <button
            onClick={() => setSelectedDate(today)}
            className="text-xs font-medium mb-3 active:opacity-70"
            style={{ color: C.primary }}
          >
            {t("home.backToToday")}
          </button>
        </div>
      )}

      {activeHabits.length > 0 && (
        <>
          <DailySummaryRow savedAmount={savedToday} onManage={() => setShowManage(true)} />
          <div className="space-y-2 mb-3">
            {activeHabits.map((h) => (
              <HabitCheckItem
                key={h.id}
                habit={h}
                checked={checkinsSelected.has(h.id)}
                disabled={!checkinsSelected.has(h.id) && balance.locked_amount < h.value_usd}
                locked={
                  checkinsSelected.has(h.id) && (selectedDate < today || isWithdrawLocked(h.id))
                }
                loading={checkingId === h.id}
                onToggle={handleToggle}
              />
            ))}
            <AddHabitCard onClick={() => addFlow.setShowForm(true)} />
          </div>
        </>
      )}

      {activeHabits.length === 0 && (
        <div className="mt-3">
          <AddHabitsBox
            isToday={selectedDate === today}
            dateLabel={formatShortDate(selectedDate, lang)}
            onClick={() => addFlow.setShowForm(true)}
          />
        </div>
      )}

      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} onConfirm={handleTopUp} />}
      {showWithdraw && (
        <WithdrawModal
          withdrawable={balance.withdrawable_amount}
          onClose={() => setShowWithdraw(false)}
          onConfirm={handleWithdraw}
        />
      )}
      {showUnlock && (
        <UnlockModal locked={balance.locked_amount} onClose={() => setShowUnlock(false)} onConfirm={handleUnlock} />
      )}
      {pendingUncheck && (
        <ConfirmUncheckModal
          habit={pendingUncheck}
          onClose={() => setPendingUncheck(null)}
          onConfirm={() => {
            performUncheck(pendingUncheck);
            setPendingUncheck(null);
          }}
        />
      )}
      {pendingPastCheckin && (
        <ConfirmPastCheckinModal
          habit={pendingPastCheckin}
          onClose={() => setPendingPastCheckin(null)}
          onConfirm={() => {
            performCheckin(pendingPastCheckin);
            setPendingPastCheckin(null);
          }}
        />
      )}
      {showManage && (
        <ManageHabitsModal
          habits={habits}
          onClose={() => setShowManage(false)}
          onSaveChanges={handleSaveHabitChanges}
          onDeleteHabit={handleDeleteHabit}
          onAddNew={() => {
            setShowManage(false);
            addFlow.setShowForm(true);
          }}
        />
      )}
      {addFlow.showForm && (
        <AddHabitForm onClose={() => addFlow.setShowForm(false)} onConfirm={addFlow.handleCreateHabit} />
      )}
    </div>
  );
}

/* -------------------------------- Analytics page ------------------------------- */

function ChartTooltip({ active, payload, label, lang, t }) {
  if (!active || !payload || !payload.length) return null;
  const amount = payload[0].value;
  return (
    <div
      className="px-3 py-2 rounded-xl pointer-events-none hb-glass"
      style={{ ...body }}
    >
      <div className="text-sm font-semibold" style={{ ...mono, color: C.foreground }}>
        {formatUsd(amount)}
      </div>
      <div className="text-[11px] mt-0.5" style={{ color: C.mutedForeground }}>
        {formatShortDate(label, lang)}
      </div>
    </div>
  );
}

/* -------------------------------- Analytics page ------------------------------- */

function DottedProgressRing({
  size = 260,
  progress = 0,
  dotColor,
  dotColorActive,
  dotCount = 280,
}) {
  const resolvedDotColor = dotColor || C.mutedForeground;
  const resolvedDotColorActive = dotColorActive || C.foreground;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const dots = useMemo(() => {
    const center = size / 2;
    const outerR = size * 0.46;
    const innerR = size * 0.32;
    const numRings = 14;
    const dotsPerRing = Math.round(dotCount / numRings);
    const list = [];

    for (let ring = 0; ring < numRings; ring++) {
      const t = ring / (numRings - 1); // 0..1 across the band's thickness
      const radius = innerR + t * (outerR - innerR);
      // Bell-curve taper on dot size only, so the band's inner/outer edges
      // read softer while every dot still sits on an exact grid position.
      const sizeFactor = 0.6 + 0.4 * Math.sin(Math.PI * t);

      // Rotate each successive ring by a golden-ratio fraction of a step.
      // This is still an exact, deterministic formula, but the irrational
      // increment never repeats across rings, so dots never line up into
      // radial spokes the way a fixed half-step offset would.
      const stepAngle = 360 / dotsPerRing;
      const ringOffset = ring * stepAngle * 0.6180339887;

      for (let i = 0; i < dotsPerRing; i++) {
        const angle = (i / dotsPerRing) * 360 + ringOffset;
        const angleRad = (angle * Math.PI) / 180;
        const x = center + radius * Math.cos(angleRad);
        const y = center + radius * Math.sin(angleRad);
        list.push({ angle, x, y, sizeFactor });
      }
    }
    return list;
  }, [size, dotCount]);

  // Progress arc starts at 12 o'clock and sweeps clockwise. SVG angle 0 is
  // 3 o'clock, so shift by -90deg to align the start with the top.
  const progressAngleEnd = clampedProgress * 3.6;
  const isActive = (angle) => {
    const shifted = (angle + 90) % 360;
    return shifted <= progressAngleEnd;
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        {dots.map((d, i) => {
          const active = isActive(d.angle);
          const r = (active ? 1.7 : 1.3) * d.sizeFactor;
          const opacity = active ? 0.9 : 0.3;
          return (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={r}
              fill={active ? resolvedDotColorActive : resolvedDotColor}
              opacity={opacity}
            />
          );
        })}
      </svg>
      <span className="text-4xl font-bold" style={{ ...mono, color: C.foreground }}>
        {Math.round(clampedProgress)}%
      </span>
    </div>
  );
}

function SavedAmountText({ savedAmount, targetAmount }) {
  const { t } = useLang();
  return (
    <div className="text-center">
      <span style={{ ...mono }}>
        <span className="text-3xl font-bold" style={{ color: C.foreground }}>
          {formatUsd(savedAmount)}
        </span>
        <span className="text-lg font-normal" style={{ color: C.mutedForeground }}>
          /{formatUsd(targetAmount)}
        </span>
      </span>
      <p className="text-xs mt-1" style={{ color: C.mutedForeground, ...body }}>
        {t("analytics.isSaved")}
      </p>
    </div>
  );
}

function DailyTrendSparkline({ data, color }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={56}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AnalyticsStatCard({ dark, className = "", children }) {
  return (
    <div
      className={`rounded-2xl p-4 flex flex-col ${dark ? "" : "hb-glass"} ${className}`}
      style={dark ? { background: C.primary, color: C.primaryForeground } : undefined}
    >
      {children}
    </div>
  );
}

function Top3DonutCard({ data }) {
  const { t } = useLang();
  return (
    <div className="rounded-2xl p-4" style={{ border: `1px solid ${C.border}` }}>
      <span className="text-sm font-bold block mb-3" style={{ color: C.foreground, ...heading }}>
        {t("analytics.top3")}
      </span>
      <div className="flex items-center gap-5">
        <div className="shrink-0" style={{ width: 110, height: 110 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={28}
                outerRadius={50}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke={C.border} strokeWidth={1} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2.5">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ background: d.color, border: `1px solid ${C.border}` }}
              />
              <span className="text-xs" style={{ color: C.foreground, ...body }}>
                {d.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsPlaceholder({ label, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl flex items-center justify-center px-4 py-8 text-center ${className}`}
      style={{ border: `1.5px dashed ${C.border}`, ...style }}
    >
      <span className="text-xs font-medium" style={{ color: C.mutedForeground, ...body }}>
        {label}
      </span>
    </div>
  );
}

// Mock data for the in-progress Analytics build - to be replaced by
// useAnalytics() once every section's UI is confirmed.
const MOCK_DAILY_TREND = [200, 500, 350, 750, 700, 900, 950];
const MOCK_TOTAL_SAVED = 1760;
const MOCK_BEST_HABIT = { name: "Drinking 3L Water", amount: 180 };
const MOCK_COMPLETED_COUNT = 15;
const MOCK_TOP3 = [
  { name: "Drinking 3L Water", value: 180, color: "#191919" },
  { name: "Read 1 hour", value: 120, color: "#9A9A96" },
  { name: "Meditate in the morning", value: 60, color: "#FFFFFF" },
];

function AnalyticsPage() {
  const { t } = useLang();

  return (
    <div className="max-w-lg mx-auto px-4 pb-20">
      <div className="flex items-center gap-2.5 py-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center hb-glass">
          <Landmark size={16} color={C.primary} />
        </div>
        <span className="text-lg tracking-wide" style={heading}>
          HabitBank
        </span>
      </div>

      <h1 className="text-xl tracking-wide mb-6" style={heading}>
        {t("analytics.welcomeTitle")}
      </h1>

      <div className="space-y-3">
        <div className="rounded-2xl flex flex-col items-center justify-center gap-4 py-8">
          <DottedProgressRing progress={36} />
          <SavedAmountText savedAmount={500} targetAmount={180} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <AnalyticsStatCard>
            <span className="text-xs font-medium mb-1" style={{ color: C.mutedForeground }}>
              {t("analytics.dailyMoving")}
            </span>
            <DailyTrendSparkline data={MOCK_DAILY_TREND} color={C.foreground} />
          </AnalyticsStatCard>

          <AnalyticsStatCard dark>
            <span className="text-xs" style={{ color: C.primaryForeground, opacity: 0.7 }}>
              {t("analytics.youHaveSaved")}
            </span>
            <div className="mt-1">
              <span className="text-2xl font-bold" style={{ ...mono, color: C.primaryForeground }}>
                {formatUsd(MOCK_TOTAL_SAVED)}
              </span>
            </div>
            <span className="text-xs mt-1" style={{ color: C.primaryForeground, opacity: 0.7 }}>
              {t("analytics.inTotal")}
            </span>
          </AnalyticsStatCard>

          <AnalyticsStatCard dark>
            <span className="text-xs" style={{ color: C.primaryForeground, opacity: 0.7 }}>
              {t("analytics.bestEarningHabit")}
            </span>
            <span className="text-base font-bold mt-1 leading-snug" style={{ color: C.primaryForeground }}>
              {MOCK_BEST_HABIT.name}
            </span>
            <span className="text-xs mt-1" style={{ color: C.primaryForeground, opacity: 0.7 }}>
              {formatUsd(MOCK_BEST_HABIT.amount)} {t("analytics.saved")}
            </span>
          </AnalyticsStatCard>

          <AnalyticsStatCard className="items-center text-center justify-center">
            <span className="text-xs" style={{ color: C.mutedForeground }}>
              {t("analytics.youHaveCompleted")}
            </span>
            <span className="text-4xl font-bold my-1" style={{ ...mono, color: C.foreground }}>
              {MOCK_COMPLETED_COUNT}
            </span>
            <span className="text-xs" style={{ color: C.mutedForeground }}>
              {t("analytics.inThisSession")}
            </span>
          </AnalyticsStatCard>
        </div>
        <Top3DonutCard data={MOCK_TOP3} />
      </div>
    </div>
  );
}

/* --------------------------------- Profile page -------------------------------- */

function ProfilePage({ user, onLogout }) {
  const { t, lang } = useLang();
  const initials = (user.full_name || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-lg mx-auto px-4 pb-20">
      <div className="flex flex-col items-center py-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-3 hb-glass"
        >
          <span className="text-2xl" style={{ ...heading, color: C.primary }}>
            {initials}
          </span>
        </div>
        <span className="text-2xl tracking-wide" style={heading}>
          {user.full_name}
        </span>
      </div>

      <div className="rounded-2xl hb-glass">
        <ProfileRow icon={<Mail size={16} color={C.mutedForeground} />} label={t("profile.email")} value={user.email} />
        <ProfileRow icon={<Shield size={16} color={C.mutedForeground} />} label={t("profile.role")} value={t("profile.roleUser")} />
        <ProfileRow icon={<CalendarDays size={16} color={C.mutedForeground} />} label={t("profile.memberSince")} value={formatMemberSince(user.created_date, lang)} />
        <ThemeToggleRow />
      </div>

      <button
        onClick={onLogout}
        className="w-full h-12 rounded-xl text-sm font-medium mt-6 transition-opacity active:opacity-70 hb-glass"
        style={{ color: C.destructive }}
      >
        {t("profile.logout")}
      </button>
    </div>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 [&:not(:last-child)]:border-b"
      style={{ borderColor: C.border }}
    >
      {icon}
      <div className="flex-1 flex items-center justify-between">
        <span className="text-sm" style={{ color: C.mutedForeground }}>
          {label}
        </span>
        <span className="text-sm font-medium" style={{ color: C.foreground }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function ThemeToggleRow() {
  const { t } = useLang();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 [&:not(:last-child)]:border-b"
      style={{ borderColor: C.border }}
    >
      {isDark ? <Moon size={16} color={C.mutedForeground} /> : <Sun size={16} color={C.mutedForeground} />}
      <div className="flex-1 flex items-center justify-between">
        <span className="text-sm" style={{ color: C.mutedForeground }}>
          {t("profile.darkMode")}
        </span>
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={t("profile.darkMode")}
          className="w-11 h-6 rounded-full relative shrink-0 transition-colors"
          style={{ background: isDark ? C.primary : C.border }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
            style={{ left: isDark ? "22px" : "2px", background: isDark ? C.primaryForeground : "#FFFFFF" }}
          />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Habit calendar page ----------------------------- */

// Archived habits (e.g. from a calendar reset) are hidden from today/future
// so they stop being schedulable, but they still show up on past dates
// exactly as if they weren't archived - so the calendar (and Analytics)
// keep an accurate record of what was actually completed back then.
const habitsForDate = (habits, iso) =>
  habits.filter((h) => {
    if (h.archived && iso >= todayStr()) return false;
    if ((h.excludedDates || []).includes(iso)) return false;
    if (h.type === "custom") return (h.scheduledDates || []).includes(iso);
    if (h.type === "weekly") return (h.weekdays || []).includes(new Date(iso + "T00:00:00").getDay());
    return true;
  });

function HabitTag({ habit }) {
  const { t } = useLang();
  const displayName = habit.nameKey ? t(habit.nameKey) : habit.name;
  return (
    <span
      className="block w-full truncate text-[9px] font-medium px-1.5 py-0.5 rounded-md mb-0.5"
      style={{ background: C.muted, color: C.foreground }}
      title={displayName}
    >
      {displayName}
    </span>
  );
}

function CalendarViewToggle({ view, setView }) {
  const { t } = useLang();
  const options = [
    { key: "monthly", label: t("calendar.monthly") },
    { key: "weekly", label: t("calendar.weekly") },
    { key: "daily", label: t("calendar.daily") },
  ];
  return (
    <div className="flex rounded-full p-1 mb-4 hb-glass" style={{ background: C.muted }}>
      {options.map((o) => {
        const active = view === o.key;
        return (
          <button
            key={o.key}
            onClick={() => setView(o.key)}
            className="flex-1 text-xs font-semibold py-2 rounded-full transition-opacity active:opacity-80"
            style={{ background: active ? C.card : "transparent", color: active ? C.foreground : C.mutedForeground }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function HabitDayList({ dayHabits }) {
  const { t } = useLang();
  if (dayHabits.length === 0) {
    return (
      <p className="text-sm text-center py-6" style={{ color: C.mutedForeground }}>
        {t("calendar.noHabitsThisDay")}
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {dayHabits.map((h) => {
        const displayName = h.nameKey ? t(h.nameKey) : h.name;
        return (
          <div
            key={h.id}
            className="flex items-center justify-between rounded-xl px-3.5 py-3"
            style={{ background: C.muted }}
          >
            <span className="text-sm font-medium" style={{ color: C.foreground }}>
              {displayName}
            </span>
            <span className="text-xs font-semibold" style={{ ...mono, color: C.mutedForeground }}>
              {formatUsd(h.value_usd)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ConfirmRecurringDeleteModal({ habitName, onClose, onDeleteThisDay, onDeleteAll }) {
  const { t } = useLang();
  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={t("modal.confirmRecurringDeleteTitle")} onClose={onClose} />
      <p className="text-sm mb-1" style={{ color: C.foreground, ...body }}>
        {habitName}
      </p>
      <p className="text-xs mb-5" style={{ color: C.mutedForeground }}>
        {t("modal.confirmRecurringDeleteDesc")}
      </p>
      <div className="space-y-2">
        <button
          onClick={onDeleteThisDay}
          className="w-full h-11 rounded-xl text-sm font-semibold hb-glass transition-opacity active:opacity-80"
          style={{ color: C.foreground }}
        >
          {t("modal.deleteThisDayOnly")}
        </button>
        <button
          onClick={onDeleteAll}
          className="w-full h-11 rounded-xl text-sm font-semibold transition-opacity active:opacity-80"
          style={{ background: "transparent", color: C.destructive, border: `1px solid ${C.border}` }}
        >
          {t("modal.deleteEntireHabit")}
        </button>
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl text-sm font-semibold transition-opacity active:opacity-80"
          style={{ color: C.mutedForeground }}
        >
          {t("modal.cancel")}
        </button>
      </div>
    </ModalBase>
  );
}

function AddHabitForDayForm({ dateLabel, onClose, onConfirm }) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const submit = () => {
    if (!name.trim() || !(Number(value) > 0)) return;
    onConfirm(name.trim(), Number(value));
  };

  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={`${t("calendar.addHabitForDay")} — ${dateLabel}`} onClose={onClose} />
      <label className="text-xs font-medium mb-1.5 block" style={{ color: C.mutedForeground }}>
        {t("modal.name")}
      </label>
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("modal.namePlaceholder")}
        className="w-full h-12 px-3.5 rounded-xl outline-none text-sm mb-3 hb-glass"
        style={{ color: C.foreground, ...body }}
      />
      <label className="text-xs font-medium mb-1.5 block" style={{ color: C.mutedForeground }}>
        {t("modal.valuePerCompletion")}
      </label>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="500"
        className="w-full h-12 px-3.5 rounded-xl outline-none text-sm mb-5 hb-glass"
        style={{ color: C.foreground, ...mono }}
      />
      <button
        onClick={submit}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium transition-opacity active:opacity-80"
        style={{ background: "transparent", color: C.foreground }}
      >
        {t("modal.createHabit")}
      </button>
    </ModalBase>
  );
}

function DayEditorModal({ dateIso, habits, checkins, balance, user, setHabits, setCheckins, showToast, onClose }) {
  const { t, lang } = useLang();
  const todayIso = todayStr();
  const title = dateIso === todayIso ? t("calendar.today") : formatShortDate(dateIso, lang);
  const dayHabits = useMemo(() => habitsForDate(habits, dateIso), [habits, dateIso]);
  const isPastDay = dateIso < todayIso;
  const isHabitLocked = (habitId) => {
    const c = checkins.find((c) => c.habit_id === habitId && c.completed_date === dateIso);
    if (!c) return false;
    if (isPastDay) return true;
    return !!balance?.withdrawn_at && !!c.created_at && c.created_at <= balance.withdrawn_at;
  };

  const [mode, setMode] = useState("view"); // view | edit
  const [draftHabits, setDraftHabits] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]); // [{ habit, scope: "thisDayOnly" | "entire" }]
  const [pendingRecurringDelete, setPendingRecurringDelete] = useState(null);
  const [pendingSimpleDelete, setPendingSimpleDelete] = useState(null);
  const [showAddForDay, setShowAddForDay] = useState(false);
  const [saving, setSaving] = useState(false);

  const enterEditMode = () => {
    setDraftHabits(dayHabits.map((h) => ({ ...h })));
    setPendingDeletions([]);
    setMode("edit");
  };

  const cancelEdit = () => {
    setDraftHabits([]);
    setPendingDeletions([]);
    setMode("view");
  };

  const handleRename = (id, name) => {
    setDraftHabits((prev) => prev.map((h) => (h.id === id ? { ...h, name } : h)));
  };
  const handleValueChange = (id, value_usd) => {
    setDraftHabits((prev) => prev.map((h) => (h.id === id ? { ...h, value_usd } : h)));
  };

  const handleRequestDelete = (habit) => {
    if (habit.type === "daily" || habit.type === "weekly") {
      setPendingRecurringDelete(habit);
    } else {
      setPendingSimpleDelete(habit);
    }
  };

  // Deletions are only queued locally here; nothing is persisted until Save.
  const queueDeletion = (habit, scope) => {
    setPendingDeletions((prev) => [...prev, { habit, scope }]);
    setDraftHabits((prev) => prev.filter((h) => h.id !== habit.id));
    setPendingRecurringDelete(null);
    setPendingSimpleDelete(null);
  };

  const handleAddForDay = async (name, value_usd) => {
    setShowAddForDay(false);
    try {
      const habit = await addCustomHabit(user.id, name, value_usd, [dateIso]);
      setHabits((prev) => [...prev, habit]);
      if (mode === "edit") setDraftHabits((prev) => [...prev, habit]);
      showToast(t("toast.habitCreated"));
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const { habit, scope } of pendingDeletions) {
        if (scope === "entire") {
          await deleteHabit(habit.id);
          setHabits((prev) => prev.filter((h) => h.id !== habit.id));
          setCheckins((prev) => prev.filter((c) => c.habit_id !== habit.id));
        } else {
          const nextExcluded = [...(habit.excludedDates || []), dateIso];
          await setHabitExcludedDates(habit.id, nextExcluded);
          setHabits((prev) => prev.map((h) => (h.id === habit.id ? { ...h, excludedDates: nextExcluded } : h)));
        }
      }

      const changed = draftHabits.filter((d) => {
        const original = dayHabits.find((h) => h.id === d.id);
        return (
          original &&
          (original.name !== d.name || original.value_usd !== d.value_usd) &&
          d.name.trim() &&
          d.value_usd > 0
        );
      });
      if (changed.length > 0) {
        await Promise.all(changed.map((h) => updateHabit(h.id, { name: h.name, value_usd: h.value_usd })));
        setHabits((prev) =>
          prev.map((h) => {
            const c = changed.find((x) => x.id === h.id);
            return c ? { ...h, name: c.name, value_usd: c.value_usd } : h;
          })
        );
      }
    } catch (e) {
      showToast(e.message, "error");
    }
    setSaving(false);
    setDraftHabits([]);
    setPendingDeletions([]);
    setMode("view");
  };

  const pendingHabitName = (habit) => (habit.nameKey ? t(habit.nameKey) : habit.name);
  const listToShow = mode === "edit" ? draftHabits : dayHabits;

  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={title} onClose={onClose} />

      {listToShow.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: C.mutedForeground }}>
          {t("calendar.noHabitsThisDay")}
        </p>
      ) : mode === "edit" ? (
        <div className="space-y-2 mb-4">
          {listToShow.map((h) =>
            isHabitLocked(h.id) ? (
              <LockedManageHabitRow key={h.id} habit={h} />
            ) : (
              <ManageHabitRow
                key={h.id}
                habit={h}
                onRename={handleRename}
                onValueChange={handleValueChange}
                onRequestDelete={handleRequestDelete}
              />
            )
          )}
        </div>
      ) : (
        <HabitDayList dayHabits={listToShow} />
      )}

      <button
        onClick={() => setShowAddForDay(true)}
        className="w-full flex items-center justify-center gap-1.5 text-sm font-medium py-3 rounded-xl mb-3 hb-glass active:opacity-80"
        style={{ color: C.foreground }}
      >
        <Plus size={14} />
        {t("calendar.addHabitForDay")}
      </button>

      {mode === "view" ? (
        <button
          onClick={enterEditMode}
          className="w-full h-11 rounded-xl text-sm font-semibold hb-glass transition-opacity active:opacity-80"
          style={{ color: C.foreground }}
        >
          {t("modal.edit")}
        </button>
      ) : (
        <div className="flex gap-2.5">
          <button
            onClick={cancelEdit}
            className="flex-1 h-11 rounded-xl text-sm font-semibold hb-glass transition-opacity active:opacity-80"
            style={{ color: C.foreground }}
          >
            {t("modal.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-11 rounded-xl text-sm font-semibold hb-glass transition-opacity active:opacity-80 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ color: C.foreground }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {t("modal.save")}
          </button>
        </div>
      )}

      {showAddForDay && (
        <AddHabitForDayForm dateLabel={title} onClose={() => setShowAddForDay(false)} onConfirm={handleAddForDay} />
      )}
      {pendingRecurringDelete && (
        <ConfirmRecurringDeleteModal
          habitName={pendingHabitName(pendingRecurringDelete)}
          onClose={() => setPendingRecurringDelete(null)}
          onDeleteThisDay={() => queueDeletion(pendingRecurringDelete, "thisDayOnly")}
          onDeleteAll={() => queueDeletion(pendingRecurringDelete, "entire")}
        />
      )}
      {pendingSimpleDelete && (
        <ConfirmDeleteHabitModal
          habitName={pendingHabitName(pendingSimpleDelete)}
          onClose={() => setPendingSimpleDelete(null)}
          onConfirm={() => queueDeletion(pendingSimpleDelete, "entire")}
        />
      )}
    </ModalBase>
  );
}

function ResetCalendarModal({ onClose, onConfirm }) {
  const { t } = useLang();
  const [confirmText, setConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);
  const canConfirm = confirmText.trim().toUpperCase() === "RESET";

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setResetting(true);
    await onConfirm();
    setResetting(false);
  };

  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={t("modal.resetCalendarTitle")} onClose={onClose} />
      <p className="text-sm font-semibold mb-1" style={{ color: C.destructive }}>
        {t("modal.resetCalendarWarning")}
      </p>
      <p className="text-xs mb-4" style={{ color: C.mutedForeground }}>
        {t("modal.resetCalendarDesc")}
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="RESET"
        className="w-full h-12 px-3.5 rounded-xl outline-none text-sm mb-4 hb-glass"
        style={{ color: C.foreground, ...mono }}
      />
      <button
        onClick={handleConfirm}
        disabled={!canConfirm || resetting}
        className="w-full h-12 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity active:opacity-80 flex items-center justify-center gap-2"
        style={{ background: C.destructive, color: C.destructiveForeground }}
      >
        {resetting && <Loader2 size={15} className="animate-spin" />}
        {t("modal.resetCalendarConfirm")}
      </button>
    </ModalBase>
  );
}

function MonthlyCalendarView({ habits, checkins, balance, user, setHabits, setCheckins, showToast }) {
  const { lang } = useLang();
  const todayIso = todayStr();
  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const [viewDate, setViewDate] = useState(startOfMonth(new Date(todayIso + "T00:00:00")));
  const [selectedDay, setSelectedDay] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toIso = (d) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="rounded-2xl p-3 hb-glass">
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          onClick={goPrevMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center active:opacity-60"
        >
          <ChevronLeft size={15} color={C.foreground} />
        </button>
        <span className="text-sm font-semibold" style={{ color: C.foreground }}>
          {formatMonthTitle(year, month, lang)}
        </span>
        <button onClick={goNextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center active:opacity-60">
          <ChevronRight size={15} color={C.foreground} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS[lang].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium py-1" style={{ color: C.mutedForeground }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const iso = toIso(d);
          const isToday = iso === todayIso;
          const dayHabits = habitsForDate(habits, iso);
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(iso)}
              className="w-full text-left rounded-lg p-1 min-h-[54px] flex flex-col items-start active:opacity-70"
              style={{
                background: isToday ? C.secondary : "transparent",
                border: isToday ? `1px solid ${C.primary}55` : "1px solid transparent",
              }}
            >
              <span
                className="text-[10px] font-medium mb-0.5"
                style={{ ...mono, color: isToday ? C.foreground : C.mutedForeground }}
              >
                {d}
              </span>
              {dayHabits.slice(0, 2).map((h) => (
                <HabitTag key={h.id} habit={h} />
              ))}
              {dayHabits.length > 2 && (
                <span className="text-[9px]" style={{ color: C.mutedForeground }}>
                  +{dayHabits.length - 2}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selectedDay && (
        <DayEditorModal
          dateIso={selectedDay}
          habits={habits}
          checkins={checkins}
          balance={balance}
          user={user}
          setHabits={setHabits}
          setCheckins={setCheckins}
          showToast={showToast}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

function WeeklyCalendarView({ habits, checkins, balance, user, setHabits, setCheckins, showToast }) {
  const { lang } = useLang();
  const todayIso = todayStr();
  const [weekStart, setWeekStart] = useState(() => shiftDateStr(todayIso, -new Date(todayIso + "T00:00:00").getDay()));
  const [selectedDay, setSelectedDay] = useState(null);

  const days = [];
  for (let i = 0; i < 7; i++) days.push(shiftDateStr(weekStart, i));

  const goPrevWeek = () => setWeekStart((w) => shiftDateStr(w, -7));
  const goNextWeek = () => setWeekStart((w) => shiftDateStr(w, 7));

  return (
    <div className="rounded-2xl p-3 hb-glass">
      <div className="flex items-center justify-between mb-3 px-1">
        <button onClick={goPrevWeek} className="w-7 h-7 rounded-lg flex items-center justify-center active:opacity-60">
          <ChevronLeft size={15} color={C.foreground} />
        </button>
        <span className="text-sm font-semibold" style={{ color: C.foreground }}>
          {formatShortDate(days[0], lang)} – {formatShortDate(days[6], lang)}
        </span>
        <button onClick={goNextWeek} className="w-7 h-7 rounded-lg flex items-center justify-center active:opacity-60">
          <ChevronRight size={15} color={C.foreground} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((iso) => {
          const isToday = iso === todayIso;
          const dayHabits = habitsForDate(habits, iso);
          return (
            <button
              key={iso}
              onClick={() => setSelectedDay(iso)}
              className="w-full rounded-lg p-1 min-h-[120px] flex flex-col items-center active:opacity-70"
              style={{
                background: isToday ? C.secondary : "transparent",
                border: isToday ? `1px solid ${C.primary}55` : "1px solid transparent",
              }}
            >
              <span className="text-[9px] font-medium mt-0.5" style={{ color: C.mutedForeground }}>
                {dayAbbrev(iso, lang)}
              </span>
              <span
                className="text-xs font-semibold mb-1"
                style={{ ...mono, color: isToday ? C.foreground : C.mutedForeground }}
              >
                {dayNum(iso)}
              </span>
              <div className="w-full">
                {dayHabits.map((h) => (
                  <HabitTag key={h.id} habit={h} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
      {selectedDay && (
        <DayEditorModal
          dateIso={selectedDay}
          habits={habits}
          checkins={checkins}
          balance={balance}
          user={user}
          setHabits={setHabits}
          setCheckins={setCheckins}
          showToast={showToast}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

function DailyCalendarView({ habits, checkins, balance, user, setHabits, setCheckins, showToast }) {
  const { t, lang } = useLang();
  const todayIso = todayStr();
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [editing, setEditing] = useState(false);
  const dayHabits = habitsForDate(habits, selectedDate);

  return (
    <div className="rounded-2xl p-4 hb-glass">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setSelectedDate((d) => shiftDateStr(d, -1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center active:opacity-60"
        >
          <ChevronLeft size={15} color={C.foreground} />
        </button>
        <span className="text-sm font-semibold" style={{ color: C.foreground }}>
          {selectedDate === todayIso ? t("calendar.today") : formatShortDate(selectedDate, lang)}
        </span>
        <button
          onClick={() => setSelectedDate((d) => shiftDateStr(d, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center active:opacity-60"
        >
          <ChevronRight size={15} color={C.foreground} />
        </button>
      </div>
      <HabitDayList dayHabits={dayHabits} />
      <button
        onClick={() => setEditing(true)}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl mt-3 hb-glass active:opacity-80"
        style={{ color: C.foreground }}
      >
        <SlidersHorizontal size={13} />
        {t("calendar.editDay")}
      </button>
      {editing && (
        <DayEditorModal
          dateIso={selectedDate}
          habits={habits}
          checkins={checkins}
          balance={balance}
          user={user}
          setHabits={setHabits}
          setCheckins={setCheckins}
          showToast={showToast}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

function HabitCalendarPage({ user, habits, setHabits, checkins, setCheckins, balance, showToast }) {
  const { t } = useLang();
  const [view, setView] = useState("monthly");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const addFlow = useAddHabitFlow(user, setHabits, showToast);

  const handleResetCalendar = async () => {
    try {
      // Habits with at least one check-in have history the Analytics page
      // depends on - deleting them would cascade-delete their check-ins too
      // (schema: checkins.habit_id references habits(id) on delete cascade)
      // and wipe that history. So those get archived (stop appearing as
      // schedulable going forward) instead of deleted; only habits with zero
      // check-ins ever - which have no history to lose - are hard-deleted.
      const checkedHabitIds = new Set(checkins.map((c) => c.habit_id));
      const habitsWithHistory = habits.filter((h) => checkedHabitIds.has(h.id));
      const habitsWithoutHistory = habits.filter((h) => !checkedHabitIds.has(h.id));

      await Promise.all([
        ...habitsWithoutHistory.map((h) => deleteHabit(h.id)),
        ...habitsWithHistory.map((h) => setHabitArchived(h.id, true)),
      ]);

      setHabits((prev) =>
        prev
          .filter((h) => checkedHabitIds.has(h.id))
          .map((h) => ({ ...h, archived: true }))
      );
      setShowResetConfirm(false);
      showToast(t("toast.calendarReset"));
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const viewProps = { habits, checkins, balance, user, setHabits, setCheckins, showToast };

  return (
    <div className="max-w-lg mx-auto px-4 pb-20">
      <div className="py-4">
        <span className="text-xl tracking-wide" style={heading}>
          {t("calendar.title")}
        </span>
      </div>

      <CalendarViewToggle view={view} setView={setView} />

      {view === "monthly" && <MonthlyCalendarView {...viewProps} />}
      {view === "weekly" && <WeeklyCalendarView {...viewProps} />}
      {view === "daily" && <DailyCalendarView {...viewProps} />}

      <button
        onClick={() => addFlow.setShowForm(true)}
        className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold py-3 rounded-xl mt-4 hb-glass active:opacity-80"
        style={{ color: C.foreground }}
      >
        <Plus size={14} />
        {t("calendar.addHabits")}
      </button>
      <button
        onClick={() => setShowResetConfirm(true)}
        className="w-full text-xs font-medium py-3 mt-1 active:opacity-70"
        style={{ color: C.destructive }}
      >
        {t("calendar.resetCalendar")}
      </button>

      {addFlow.showForm && (
        <AddHabitForm onClose={() => addFlow.setShowForm(false)} onConfirm={addFlow.handleCreateHabit} />
      )}
      {showResetConfirm && (
        <ResetCalendarModal onClose={() => setShowResetConfirm(false)} onConfirm={handleResetCalendar} />
      )}
    </div>
  );
}

/* ---------------------------------- App layout --------------------------------- */

function AppLayout({ user, tab, setTab, onLogout, habits, setHabits, checkins, setCheckins, balance, setBalance, showToast }) {
  return (
    <div className="min-h-screen w-full" style={{ color: C.foreground, ...body }}>
      <style>{FONT_IMPORT}</style>
      {tab === "home" && (
        <HomePage
          user={user}
          setTab={setTab}
          habits={habits}
          setHabits={setHabits}
          checkins={checkins}
          setCheckins={setCheckins}
          balance={balance}
          setBalance={setBalance}
          showToast={showToast}
        />
      )}
      {tab === "analytics" && <AnalyticsPage />}
      {tab === "calendar" && (
        <HabitCalendarPage
          user={user}
          habits={habits}
          setHabits={setHabits}
          checkins={checkins}
          setCheckins={setCheckins}
          balance={balance}
          showToast={showToast}
        />
      )}
      {tab === "profile" && <ProfilePage user={user} onLogout={onLogout} />}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

/* ------------------------------------ Root -------------------------------------- */

function App() {
  const [route, setRoute] = useState("login"); // login | register | forgot-password | reset-password | app
  const [tab, setTab] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, showToast] = useToast();
  const [lang, setLang] = useState("en");
  const t = makeT(lang);
  const [theme, setTheme] = useState(() => localStorage.getItem("hb-theme") || "light");
  C = theme === "dark" ? DARK_COLORS : LIGHT_COLORS;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("hb-theme", theme);
  }, [theme]);

  const [habits, setHabits] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [balance, setBalance] = useState({ locked_amount: 0, withdrawable_amount: 0, withdrawn_at: null });

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setRoute("reset-password");
        setLoading(false);
        return;
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
        setHabits([]);
        setCheckins([]);
        setBalance({ locked_amount: 0, withdrawable_amount: 0 });
        setRoute("login");
        setLoading(false);
        return;
      }
      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") return;

      if (session?.user) {
        try {
          const { profile, balance: balanceData, habits: habitsData, checkins: checkinsData } = await loadUserData(
            session.user.id
          );
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: profile?.full_name || session.user.email.split("@")[0],
            created_date: (profile?.created_at || session.user.created_at || todayStr()).slice(0, 10),
          });
          setBalance(balanceData);
          setHabits(habitsData);
          setCheckins(checkinsData);
          setTab("home");
          setRoute("app");
          if (event === "SIGNED_IN") showToast(t("toast.welcomeBack"));
        } catch (e) {
          showToast(e.message, "error");
        }
      }
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <style>{FONT_IMPORT}</style>
        <AmbientBackground />
        <Loader2 size={28} className="animate-spin" color={C.primary} />
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <LangContext.Provider value={{ lang, setLang, t }}>
        <style>{FONT_IMPORT}</style>
        <AmbientBackground />
        <Toast toast={toast} />
        {route === "login" && <LoginPage goto={setRoute} showToast={showToast} />}
        {route === "register" && <RegisterPage goto={setRoute} showToast={showToast} />}
        {route === "forgot-password" && <ForgotPasswordPage goto={setRoute} showToast={showToast} />}
        {route === "reset-password" && <ResetPasswordPage goto={setRoute} showToast={showToast} />}
        {route === "app" && user && (
          <AppLayout
            user={user}
            tab={tab}
            setTab={setTab}
            onLogout={handleLogout}
            habits={habits}
            setHabits={setHabits}
            checkins={checkins}
            setCheckins={setCheckins}
            balance={balance}
            setBalance={setBalance}
            showToast={showToast}
          />
        )}
      </LangContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
