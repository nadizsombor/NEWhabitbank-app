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
} from "recharts";

import { supabase } from "./lib/supabaseClient";
import {
  loadUserData,
  addDailyHabit,
  addCustomHabit,
  setBalanceAmounts,
  addCheckin,
  removeCheckin,
  updateHabit,
  deleteHabit,
} from "./lib/api";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap');
  .hb-glass {
    position: relative;
    overflow: hidden;
    background: rgba(255,255,255,0.055);
    backdrop-filter: blur(64px) saturate(150%);
    -webkit-backdrop-filter: blur(64px) saturate(150%);
    border: 1px solid rgba(255,255,255,0.14);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 1px rgba(255,255,255,0.08), 0 20px 50px -20px rgba(0,0,0,0.85);
  }
  .hb-glass::after {
    content: "";
    position: absolute;
    inset: -60% -20%;
    background: linear-gradient(125deg, transparent 32%, rgba(255,255,255,0.16) 46%, rgba(255,255,255,0.04) 53%, transparent 64%);
    pointer-events: none;
  }
`;


function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
        }}
      />
    </div>
  );
}

const SYSTEM_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const C = {
  background: "#000000",
  foreground: "#F7F7FA",
  card: "rgba(255,255,255,0.045)",
  primary: "#D1D1D6",
  primaryForeground: "#0A0A0A",
  secondary: "#8ECAE6",
  secondaryForeground: "#0A0A0A",
  muted: "rgba(255,255,255,0.07)",
  mutedForeground: "rgba(247,247,250,0.62)",
  accent: "#8ECAE6",
  destructive: "#FF7A7A",
  destructiveForeground: "#0A0A0A",
  border: "rgba(255,255,255,0.16)",
  slatePill: "rgba(140,151,163,0.4)",
};

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
  "currency": { en: "HUF", hu: "Ft" },
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
  "modal.valuePerCompletion": { en: "Value per completion (HUF)", hu: "Érték teljesítésenként (Ft)" },
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
  "home.dailySavedLabel": { en: "Saved today", hu: "Ma megtakarítva" },
  "home.manageHabits": { en: "Add or manage habits", hu: "Szokások hozzáadása / kezelése" },
  "modal.manageHabitsTitle": { en: "Manage Habits", hu: "Szokások kezelése" },
  "modal.addNewHabitRow": { en: "Add new habit", hu: "Új szokás hozzáadása" },
  "modal.save": { en: "Save", hu: "Mentés" },
  "modal.confirmUncheckTitle": { en: "Undo check-in?", hu: "Visszavonod a pipát?" },
  "modal.confirmUncheckDesc": {
    en: "The money for this habit will move back to your locked balance.",
    hu: "Ennek a szokásnak az összege visszakerül a zárolt egyenlegbe.",
  },
  "modal.confirmDeleteHabitTitle": { en: "Delete habit?", hu: "Törlöd a szokást?" },
  "modal.confirmDeleteHabitDesc": {
    en: "This permanently deletes the habit and all of its check-in history.",
    hu: "Ez véglegesen törli a szokást és az összes hozzá tartozó check-in előzményt.",
  },
  "modal.confirm": { en: "Confirm", hu: "Megerősítés" },
  "modal.cancel": { en: "Cancel", hu: "Mégse" },
  "modal.delete": { en: "Delete", hu: "Törlés" },
  "analytics.title": { en: "Analytics", hu: "Statisztika" },
  "analytics.comingSoon": { en: "Analytics coming soon", hu: "A statisztika hamarosan érkezik" },
  "analytics.subtitle": { en: "Your balance growth, day by day", hu: "Az egyenleged gyarapodása napról napra" },
  "analytics.noData": { en: "No check-ins yet — complete a habit to see your chart", hu: "Még nincs bejelölés — teljesíts egy szokást, hogy lásd a diagramot" },
  "profile.email": { en: "Email", hu: "E-mail" },
  "profile.role": { en: "Role", hu: "Szerepkör" },
  "profile.roleUser": { en: "User", hu: "Felhasználó" },
  "profile.memberSince": { en: "Member since", hu: "Tag óta" },
  "profile.logout": { en: "Log Out", hu: "Kijelentkezés" },
  "habit.workout": { en: "Workout", hu: "Edzés" },
  "habit.read": { en: "Read", hu: "Olvasás" },
  "habit.meditate": { en: "Meditate", hu: "Meditáció" },
};

const LangContext = React.createContext({ lang: "en", setLang: () => {}, t: (k) => k });
const useLang = () => React.useContext(LangContext);
const makeT = (lang) => (key) => TRANSLATIONS[key] ? TRANSLATIONS[key][lang] : key;

const fmt = (n) => Math.round(n || 0).toLocaleString("hu-HU");
const toLocalISODate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const todayStr = () => toLocalISODate(new Date());
const daysAgoStr = (n) => {
  const d = new Date();
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
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-[90%] px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-[fadeIn_0.2s_ease] hb-glass`}
      style={{
        position: "fixed",
        background: isError ? "rgba(255,122,122,0.16)" : "rgba(10,10,12,0.65)",
        color: isError ? "#FFD9D9" : C.foreground,
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
        style={{ background: "rgba(209,209,214,0.14)", color: C.foreground }}
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
            style={{ background: "rgba(209,209,214,0.14)", color: C.foreground }}
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
        style={{ background: "rgba(209,209,214,0.14)", color: C.foreground }}
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
        style={{ background: "rgba(209,209,214,0.14)", color: C.foreground }}
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
        style={{ background: "rgba(209,209,214,0.14)", color: C.foreground }}
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
    { key: "profile", label: t("nav.profile"), icon: User },
  ];
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-16 z-40 hb-glass"
      style={{
        position: "fixed",
        borderTop: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 -1px 0 rgba(255,255,255,0.1), 0 -12px 30px -14px rgba(0,0,0,0.7)",
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

function Header({ streak }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center hb-glass"
          style={{ background: "rgba(255,255,255,0.09)" }}
        >
          <Landmark size={17} color="#F2F2F5" />
        </div>
        <span className="text-lg font-bold" style={{ ...body, color: C.foreground }}>
          HabitBank
        </span>
      </div>
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hb-glass"
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        <Flame size={14} color="#E4E4E7" />
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
            {fmt(withdrawable)}
          </span>{" "}
          <span className="text-base font-sans" style={{ color: C.mutedForeground }}>
            {t("currency")}
          </span>
        </div>
        <span className="text-sm mt-1" style={{ color: C.mutedForeground, ...body }}>
          {t("balance.savedSubtitle")}
        </span>
        <button
          onClick={onWithdraw}
          className="mt-4 px-7 py-2.5 rounded-full text-sm font-semibold transition-opacity active:opacity-80"
          style={{ background: C.slatePill, color: "#F4F4F5" }}
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
            {fmt(locked)}
          </span>{" "}
          <span className="text-sm font-sans" style={{ color: C.mutedForeground }}>
            {t("currency")}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percent}%`, background: "#E4E4E7" }}
          />
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onTopUp}
            className="flex-1 h-10 rounded-full text-sm font-semibold transition-opacity active:opacity-80"
            style={{ background: C.slatePill, color: "#F4F4F5" }}
          >
            {t("balance.invest")}
          </button>
          <button
            onClick={onUnlock}
            className="flex-1 h-10 rounded-full text-sm font-semibold transition-opacity active:opacity-80"
            style={{ background: C.slatePill, color: "#F4F4F5" }}
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
  const rowTextColor = checked ? "#18181B" : C.foreground;
  const nonInteractive = locked || (disabled && !checked) || loading;
  return (
    <button
      onClick={() => !nonInteractive && onToggle(habit)}
      disabled={nonInteractive}
      className={`w-full flex items-center justify-between rounded-3xl px-4 py-4 transition-all ${checked ? "" : "hb-glass"} ${locked ? "cursor-not-allowed" : ""}`}
      style={{
        background: checked ? "rgba(228,228,231,0.94)" : "rgba(255,255,255,0.045)",
        opacity: disabled && !checked ? 0.45 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2"
          style={{
            background: checked ? "#18181B" : "transparent",
            borderColor: checked ? "#18181B" : "rgba(255,255,255,0.35)",
          }}
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" color={checked ? "#18181B" : C.mutedForeground} />
          ) : (
            checked && <Check size={14} color="#F4F4F5" strokeWidth={3} />
          )}
        </div>
        <span className="text-sm font-semibold" style={{ color: rowTextColor, ...body }}>
          {displayName}
        </span>
        {locked && <Lock size={12} color="#3F3F46" />}
      </div>
      <span
        className="text-xs font-semibold px-3 py-1.5 rounded-full"
        style={{ ...mono, color: "#E4E4E7", background: "rgba(0,0,0,0.35)" }}
      >
        {fmt(habit.value_huf)} <span className="text-[10px] font-sans">{t("currency")}</span>
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
          bg = "rgba(255,255,255,0.20)";
          textColor = C.foreground;
        } else if (isFuture) {
          bg = "rgba(255,255,255,0.10)";
          textColor = C.foreground;
        } else {
          bg = "rgba(255,255,255,0.025)";
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

function AddHabitsBox({ isToday, dateLabel, onClick }) {
  const { t } = useLang();
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl py-14 flex flex-col items-center justify-center gap-4 text-center transition-opacity active:opacity-70"
      style={{ border: "1.5px dashed rgba(255,255,255,0.3)" }}
    >
      <span className="text-sm font-semibold" style={{ color: C.foreground, ...body }}>
        {isToday ? t("home.addHabitsToday") : `${t("home.addHabitsFor")} ${dateLabel}`}
      </span>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center border-2"
        style={{ borderColor: "rgba(255,255,255,0.4)" }}
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
            style={{ background: "rgba(142,202,230,0.14)", color: C.foreground, ...mono }}
          >
            {fmt(c)}
          </button>
        ))}
      </div>
      <button
        onClick={() => amount && Number(amount) > 0 && onConfirm(Number(amount))}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium transition-opacity active:opacity-80"
        style={{ background: "rgba(209,209,214,0.14)", color: C.foreground }}
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
          {fmt(withdrawable)}
        </span>{" "}
        <span className="text-sm font-sans" style={{ color: C.mutedForeground }}>
          {t("currency")}
        </span>
      </div>
      <button
        onClick={onConfirm}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium transition-opacity active:opacity-80"
        style={{ background: "rgba(209,209,214,0.14)", color: C.foreground }}
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
          {fmt(locked)}
        </span>{" "}
        <span className="text-sm font-sans" style={{ color: C.mutedForeground }}>
          {t("currency")}
        </span>
      </div>
      <p className="text-xs mb-5" style={{ color: C.mutedForeground }}>
        {t("modal.unlockDesc")}
      </p>
      <button
        onClick={onConfirm}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium transition-opacity active:opacity-80"
        style={{ background: "rgba(209,209,214,0.14)", color: C.foreground }}
      >
        {t("modal.confirmUnlock")}
      </button>
    </ModalBase>
  );
}

function AddHabitModal({ onClose, onConfirm }) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

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
        className="w-full h-12 px-3.5 rounded-xl outline-none text-sm mb-5 hb-glass"
        style={{ color: C.foreground, ...mono }}
      />
      <button
        onClick={() => name.trim() && Number(value) > 0 && onConfirm(name.trim(), Number(value))}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium transition-opacity active:opacity-80"
        style={{ background: "rgba(209,209,214,0.14)", color: C.foreground }}
      >
        {t("modal.createHabit")}
      </button>
    </ModalBase>
  );
}

function AddHabitChoiceModal({ onClose, onChooseDaily, onChooseCustom }) {
  const { t } = useLang();
  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={t("habitType.chooseTitle")} onClose={onClose} />
      <div className="space-y-3">
        <button
          onClick={onChooseDaily}
          className="w-full text-left px-4 py-4 rounded-2xl hb-glass transition-opacity active:opacity-80 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 hb-glass" style={{ background: "rgba(209,209,214,0.14)" }}>
            <Flame size={18} color={C.foreground} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: C.foreground }}>
              {t("habitType.daily")}
            </div>
            <div className="text-xs mt-0.5" style={{ color: C.mutedForeground }}>
              {t("habitType.dailyDesc")}
            </div>
          </div>
        </button>
        <button
          onClick={onChooseCustom}
          className="w-full text-left px-4 py-4 rounded-2xl hb-glass transition-opacity active:opacity-80 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 hb-glass" style={{ background: "rgba(142,202,230,0.14)" }}>
            <CalendarDays size={18} color={C.foreground} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: C.foreground }}>
              {t("habitType.custom")}
            </div>
            <div className="text-xs mt-0.5" style={{ color: C.mutedForeground }}>
              {t("habitType.customDesc")}
            </div>
          </div>
        </button>
      </div>
    </ModalBase>
  );
}

function MiniCalendar({ selectedDates, onToggleDate }) {
  const { lang } = useLang();
  const todayIso = todayStr();
  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const [viewDate, setViewDate] = useState(startOfMonth(new Date(todayIso + "T00:00:00")));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay(); // 0 = Sunday

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toIso = (d) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const isPast = (iso) => iso < todayIso;

  const monthStartIso = toIso(1);
  const currentMonthStartIso = `${todayStr().slice(0, 8)}01`;
  const prevDisabled = monthStartIso <= currentMonthStartIso;

  const goPrevMonth = () => {
    if (prevDisabled) return;
    setViewDate(new Date(year, month - 1, 1));
  };
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="rounded-2xl p-3 hb-glass">
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          onClick={goPrevMonth}
          disabled={prevDisabled}
          className="w-7 h-7 rounded-lg flex items-center justify-center active:opacity-60 disabled:opacity-25"
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
          const disabled = isPast(iso);
          const selected = selectedDates.has(iso);
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onToggleDate(iso)}
              className="aspect-square rounded-lg flex items-center justify-center text-xs disabled:opacity-25"
              style={{
                background: selected ? C.primary : "rgba(255,255,255,0.06)",
                color: selected ? C.primaryForeground : C.foreground,
                fontWeight: selected ? 600 : 400,
                ...mono,
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CustomScheduleHabitModal({ onClose, onConfirm }) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [error, setError] = useState("");

  const toggleDate = (iso) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      return next;
    });
  };

  const submit = () => {
    if (!name.trim() || !(Number(value) > 0)) return;
    if (selectedDates.size === 0) {
      setError(t("modal.noDaysSelected"));
      return;
    }
    onConfirm(name.trim(), Number(value), Array.from(selectedDates));
  };

  return (
    <ModalBase onClose={onClose}>
      <ModalHeader title={t("modal.customHabitTitle")} onClose={onClose} />
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
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium" style={{ color: C.mutedForeground }}>
          {t("modal.selectDays")}
        </label>
        {selectedDates.size > 0 && (
          <span className="text-xs" style={{ color: C.primary, ...mono }}>
            {selectedDates.size} {t("modal.daysSelected")}
          </span>
        )}
      </div>
      <div className="mb-4">
        <MiniCalendar selectedDates={selectedDates} onToggleDate={toggleDate} />
      </div>
      {error && (
        <p className="text-xs mb-3" style={{ color: C.destructive }}>
          {error}
        </p>
      )}
      <button
        onClick={submit}
        className="hb-glass w-full h-12 rounded-xl text-sm font-medium transition-opacity active:opacity-80"
        style={{ background: "rgba(209,209,214,0.14)", color: C.foreground }}
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
      <input
        type="number"
        inputMode="numeric"
        value={habit.value_huf}
        onChange={(e) => onValueChange(habit.id, Number(e.target.value) || 0)}
        className="w-20 bg-transparent outline-none text-sm text-right rounded-lg px-2 py-1"
        style={{ color: C.foreground, background: "rgba(0,0,0,0.3)", ...mono }}
      />
      <span className="text-[10px] font-sans shrink-0" style={{ color: C.mutedForeground }}>
        {t("currency")}
      </span>
      <button
        onClick={() => onRequestDelete(habit)}
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 active:opacity-60"
        style={{ background: "rgba(255,122,122,0.12)" }}
      >
        <Trash2 size={14} color={C.destructive} />
      </button>
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
          style={{ background: C.destructive, color: "#2A0A0A" }}
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
  const [saving, setSaving] = useState(false);

  const handleRename = (id, name) => {
    setDraftHabits((prev) => prev.map((h) => (h.id === id ? { ...h, name } : h)));
  };
  const handleValueChange = (id, value_huf) => {
    setDraftHabits((prev) => prev.map((h) => (h.id === id ? { ...h, value_huf } : h)));
  };

  const handleConfirmDelete = async () => {
    const id = pendingDelete.id;
    setPendingDelete(null);
    setDraftHabits((prev) => prev.filter((h) => h.id !== id));
    await onDeleteHabit(id);
  };

  const handleSave = async () => {
    setSaving(true);
    const changed = draftHabits.filter((d) => {
      const original = habits.find((h) => h.id === d.id);
      return (
        original &&
        (original.name !== d.name || original.value_huf !== d.value_huf) &&
        d.name.trim() &&
        d.value_huf > 0
      );
    });
    await onSaveChanges(changed);
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
          style={{ background: C.slatePill, color: "#F4F4F5" }}
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
          {fmt(savedAmount)} <span className="text-xs font-sans" style={{ color: C.mutedForeground }}>{t("currency")}</span>
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
          style={{ background: C.slatePill, color: "#F4F4F5" }}
        >
          {t("modal.confirm")}
        </button>
      </div>
    </ModalBase>
  );
}

/* ---------------------------------- Home page --------------------------------- */

function HomePage({ user, habits, setHabits, checkins, setCheckins, balance, setBalance, showToast }) {
  const { t, lang } = useLang();
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [pendingUncheck, setPendingUncheck] = useState(null);
  const [checkingId, setCheckingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const today = todayStr();
  const activeHabits = habits.filter((h) => {
    if (h.archived) return false;
    if (h.type === "custom") return (h.scheduledDates || []).includes(selectedDate);
    return true;
  });
  const checkinsSelected = useMemo(
    () => new Set(checkins.filter((c) => c.completed_date === selectedDate).map((c) => c.habit_id)),
    [checkins, selectedDate]
  );

  const savedToday = useMemo(() => {
    const valueByHabit = new Map(habits.map((h) => [h.id, h.value_huf]));
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
      setBalance(next);
      showToast(`+${fmt(amount)} ${t("currency")} ${t("toast.topUpSuffix")}`);
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleWithdraw = async () => {
    const next = { locked_amount: balance.locked_amount, withdrawable_amount: 0 };
    setShowWithdraw(false);
    try {
      await setBalanceAmounts(user.id, next.locked_amount, next.withdrawable_amount);
      setBalance(next);
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
      setBalance(next);
      showToast(t("toast.withdrawComplete"));
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleAddDailyHabit = async (name, value_huf) => {
    setShowDailyModal(false);
    try {
      const habit = await addDailyHabit(user.id, name, value_huf);
      setHabits((prev) => [...prev, habit]);
      showToast(t("toast.habitCreated"));
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleAddCustomHabit = async (name, value_huf, scheduledDates) => {
    setShowCustomModal(false);
    try {
      const habit = await addCustomHabit(user.id, name, value_huf, scheduledDates);
      setHabits((prev) => [...prev, habit]);
      showToast(t("toast.habitCreated"));
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleSaveHabitChanges = async (changedHabits) => {
    if (changedHabits.length === 0) return;
    try {
      await Promise.all(changedHabits.map((h) => updateHabit(h.id, { name: h.name, value_huf: h.value_huf })));
      setHabits((prev) =>
        prev.map((h) => {
          const changed = changedHabits.find((c) => c.id === h.id);
          return changed ? { ...h, name: changed.name, value_huf: changed.value_huf } : h;
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
      locked_amount: balance.locked_amount + habit.value_huf,
      withdrawable_amount: Math.max(0, balance.withdrawable_amount - habit.value_huf),
    };
    try {
      await removeCheckin(habit.id, selectedDate);
      await setBalanceAmounts(user.id, next.locked_amount, next.withdrawable_amount);
      setBalance(next);
      setCheckins((prev) => prev.filter((c) => !(c.habit_id === habit.id && c.completed_date === selectedDate)));
      showToast(`${fmt(habit.value_huf)} ${t("currency")} ${t("toast.movedBackSuffix")}`);
    } catch (e) {
      showToast(e.message, "error");
    }
    setCheckingId(null);
  };

  const handleToggle = async (habit) => {
    const isChecked = checkinsSelected.has(habit.id);
    const isPast = selectedDate < today;

    if (isChecked) {
      if (isPast) return; // locked: past check-ins can't be modified
      setPendingUncheck(habit);
      return;
    }

    if (balance.locked_amount < habit.value_huf) {
      showToast(t("toast.insufficientBalance"), "error");
      return;
    }
    setCheckingId(habit.id);
    const next = {
      locked_amount: balance.locked_amount - habit.value_huf,
      withdrawable_amount: balance.withdrawable_amount + habit.value_huf,
    };
    try {
      const checkin = await addCheckin(user.id, habit.id, selectedDate);
      await setBalanceAmounts(user.id, next.locked_amount, next.withdrawable_amount);
      setBalance(next);
      setCheckins((prev) => [...prev, { id: checkin.id, habit_id: habit.id, completed_date: selectedDate }]);
      showToast(`+${fmt(habit.value_huf)} ${t("currency")} ${t("toast.earnedSuffix")}`);
    } catch (e) {
      showToast(e.message, "error");
    }
    setCheckingId(null);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-20">
      <Header streak={streak} />

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
                disabled={!checkinsSelected.has(h.id) && balance.locked_amount < h.value_huf}
                locked={selectedDate < today && checkinsSelected.has(h.id)}
                loading={checkingId === h.id}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </>
      )}

      {habits.length === 0 && (
        <div className="mt-3">
          <AddHabitsBox
            isToday={selectedDate === today}
            dateLabel={formatShortDate(selectedDate, lang)}
            onClick={() => setShowChoice(true)}
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
      {showManage && (
        <ManageHabitsModal
          habits={habits}
          onClose={() => setShowManage(false)}
          onSaveChanges={handleSaveHabitChanges}
          onDeleteHabit={handleDeleteHabit}
          onAddNew={() => {
            setShowManage(false);
            setShowChoice(true);
          }}
        />
      )}
      {showChoice && (
        <AddHabitChoiceModal
          onClose={() => setShowChoice(false)}
          onChooseDaily={() => {
            setShowChoice(false);
            setShowDailyModal(true);
          }}
          onChooseCustom={() => {
            setShowChoice(false);
            setShowCustomModal(true);
          }}
        />
      )}
      {showDailyModal && <AddHabitModal onClose={() => setShowDailyModal(false)} onConfirm={handleAddDailyHabit} />}
      {showCustomModal && (
        <CustomScheduleHabitModal onClose={() => setShowCustomModal(false)} onConfirm={handleAddCustomHabit} />
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
      className="px-3 py-2 rounded-xl shadow-lg pointer-events-none hb-glass"
      style={{ background: "rgba(10,10,12,0.75)", ...body }}
    >
      <div className="text-sm font-semibold" style={{ ...mono, color: "#FFFFFF" }}>
        {fmt(amount)} <span className="text-xs font-sans" style={{ color: "#C9CDD1" }}>{t("currency")}</span>
      </div>
      <div className="text-[11px] mt-0.5" style={{ color: "#ADB5BD" }}>
        {formatShortDate(label, lang)}
      </div>
    </div>
  );
}

function AnalyticsPage({ checkins, habits, withdrawable }) {
  const { t, lang } = useLang();

  const chartData = useMemo(() => {
    const valueByHabit = new Map(habits.map((h) => [h.id, h.value_huf]));
    const totalsByDate = {};
    checkins.forEach((c) => {
      const v = valueByHabit.get(c.habit_id) || 0;
      totalsByDate[c.completed_date] = (totalsByDate[c.completed_date] || 0) + v;
    });

    const windowStart = daysAgoStr(13);
    // Carry forward any earnings collected before the visible window so the
    // line starts from the correct running total instead of resetting to 0.
    let cumulative = 0;
    Object.keys(totalsByDate).forEach((iso) => {
      if (iso < windowStart) cumulative += totalsByDate[iso];
    });

    const days = [];
    for (let i = 13; i >= 0; i--) {
      const iso = daysAgoStr(i);
      cumulative += totalsByDate[iso] || 0;
      days.push({ date: iso, amount: cumulative });
    }
    return days;
  }, [checkins, habits]);

  const maxAmount = chartData.reduce((max, d) => Math.max(max, d.amount), 0);
  const yMax = Math.max(withdrawable, maxAmount) > 0 ? Math.max(withdrawable, maxAmount) : 100;
  const yTicks = [0, Math.round(yMax * 0.25), Math.round(yMax * 0.5), Math.round(yMax * 0.75), yMax];
  const hasData = chartData.some((d) => d.amount > 0);

  return (
    <div className="max-w-lg mx-auto px-4 pb-20">
      <div className="py-4">
        <span className="text-xl tracking-wide" style={heading}>
          {t("analytics.title")}
        </span>
        <p className="text-xs mt-0.5" style={{ color: C.mutedForeground }}>
          {t("analytics.subtitle")}
        </p>
      </div>

      <div className="rounded-2xl p-4 pr-3 pl-1 hb-glass">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="hbFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.primary} stopOpacity={0.35} />
                <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(iso) => dayNum(iso)}
              tick={{ fontSize: 11, fill: C.mutedForeground, fontFamily: "'Roboto Mono', monospace" }}
              axisLine={{ stroke: C.border }}
              tickLine={false}
              interval={1}
            />
            <YAxis
              domain={[0, yMax]}
              ticks={yTicks}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: C.mutedForeground, fontFamily: "'Roboto Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              width={58}
              tickFormatter={(v) => fmt(v)}
            />
            <Tooltip
              content={<ChartTooltip lang={lang} t={t} />}
              cursor={{ stroke: C.mutedForeground, strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke={C.primary}
              strokeWidth={2.5}
              fill="url(#hbFill)"
              dot={{ r: 3, fill: C.primary, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: C.primary, stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {!hasData && (
        <p className="text-xs text-center mt-4" style={{ color: C.mutedForeground }}>
          {t("analytics.noData")}
        </p>
      )}
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
      style={{ borderColor: "rgba(255,255,255,0.1)" }}
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

/* ---------------------------------- App layout --------------------------------- */

function AppLayout({ user, tab, setTab, onLogout, habits, setHabits, checkins, setCheckins, balance, setBalance, showToast }) {
  return (
    <div className="min-h-screen w-full" style={{ color: C.foreground, ...body }}>
      <style>{FONT_IMPORT}</style>
      {tab === "home" && (
        <HomePage
          user={user}
          habits={habits}
          setHabits={setHabits}
          checkins={checkins}
          setCheckins={setCheckins}
          balance={balance}
          setBalance={setBalance}
          showToast={showToast}
        />
      )}
      {tab === "analytics" && <AnalyticsPage checkins={checkins} habits={habits} withdrawable={balance.withdrawable_amount} />}
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

  const [habits, setHabits] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [balance, setBalance] = useState({ locked_amount: 0, withdrawable_amount: 0 });

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
  );
}

export default App;
