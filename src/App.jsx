import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reminders } from './data/reminders';
import {
  Globe, Volume2, Sparkles, X, BookOpen,
  Download, Check, Palette, VolumeX,
  RefreshCw, AlertCircle
} from 'lucide-react';

// ─── FONT LOADER ──────────────────────────────────────────────────────────────
const FontLoader = () => {
  useEffect(() => {
    if (document.getElementById('nur-fonts')) return;
    const l = document.createElement('link');
    l.id = 'nur-fonts';
    l.href = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&display=swap';
    l.rel = 'stylesheet';
    document.head.appendChild(l);
  }, []);
  return null;
};

// ─── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = {
  terracotta: { name: 'Terracotta', bg: '#fdf6ee', surface: '#ffffff', accent: '#e27d60', text: '#2d2926', muted: '#9e8c84', gradient: 'linear-gradient(135deg,#e27d60,#c9513a)', glow: 'rgba(226,125,96,0.28)', overlay: 'rgba(226,125,96,0.09)' },
  midnight: { name: 'Midnight', bg: '#0d0f1a', surface: '#161928', accent: '#7c6fe0', text: '#e8e6ff', muted: '#6b6985', gradient: 'linear-gradient(135deg,#7c6fe0,#4a3fa8)', glow: 'rgba(124,111,224,0.32)', overlay: 'rgba(124,111,224,0.1)' },
  emerald: { name: 'Emerald', bg: '#f0faf5', surface: '#ffffff', accent: '#1a9e6e', text: '#0d2b1e', muted: '#5a8c76', gradient: 'linear-gradient(135deg,#1a9e6e,#0d6e4c)', glow: 'rgba(26,158,110,0.28)', overlay: 'rgba(26,158,110,0.08)' },
  rose: { name: 'Rose', bg: '#fff5f7', surface: '#ffffff', accent: '#e05c7a', text: '#2a1018', muted: '#9e7080', gradient: 'linear-gradient(135deg,#e05c7a,#b83d5c)', glow: 'rgba(224,92,122,0.28)', overlay: 'rgba(224,92,122,0.08)' },
  sand: { name: 'Sand', bg: '#faf8f3', surface: '#ffffff', accent: '#c9a84c', text: '#2a2010', muted: '#9e8c60', gradient: 'linear-gradient(135deg,#c9a84c,#a07c28)', glow: 'rgba(201,168,76,0.28)', overlay: 'rgba(201,168,76,0.08)' },
};

const CALC_METHODS = [
  { id: 3, name: 'MWL', region: 'Europe, Far East, parts of USA', desc: "Muslim World League — used in most of the world. A safe default if you're unsure." },
  { id: 2, name: 'ISNA', region: 'North America', desc: 'Islamic Society of North America — best for USA & Canada.' },
  { id: 4, name: 'Makkah', region: 'Saudi Arabia & Gulf', desc: 'Umm Al-Qura University, Makkah — used in Saudi Arabia & Gulf countries.' },
  { id: 1, name: 'Karachi', region: 'Pakistan, India, Bangladesh', desc: 'University of Islamic Sciences, Karachi — South & Central Asia.' },
  { id: 5, name: 'Egypt', region: 'Africa, Syria', desc: 'Egyptian General Authority of Survey — North Africa & Middle East.' },
  { id: 11, name: 'Turkey', region: 'Turkey', desc: 'Diyanet İşleri Başkanlığı — official Turkish method.' },
  { id: 15, name: 'Tehran', region: 'Iran', desc: 'Institute of Geophysics, Tehran — Iran & some Shia communities.' },
];

const PRAYER_META = {
  Fajr: { icon: '🌙', surahId: 32, surahName: 'As-Sajdah' },
  Dhuhr: { icon: '☀️', surahId: 62, surahName: "Al-Jumu'ah" },
  Asr: { icon: '🌤', surahId: 103, surahName: 'Al-Asr' },
  Maghrib: { icon: '🌅', surahId: 56, surahName: 'Al-Waqiah' },
  Isha: { icon: '🌃', surahId: 67, surahName: 'Al-Mulk' },
};
const ACTIVE_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const HADITHS_ALERT = [
  'Between a man and disbelief is the abandoning of prayer. — Sahih Muslim',
  "The covenant between us and them is prayer. Whoever abandons it has disbelieved. — Nasa'i",
  "O servant of Allah — the angels are calling you right now. Come to prayer. Come to success.",
];
const DUAS = [
  'After prayer, say SubhanAllah 33 times, Alhamdulillah 33 times, then Allahu Akbar 34 times. The Prophet ﷺ said this wipes away sins like foam on the sea. (Bukhari & Muslim)',
  "Recite Ayat ul-Kursi after every prayer. The Prophet ﷺ said nothing stands between you and Paradise except death. (Al-Nasa'i)",
  "Say: Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik — O Allah, help me remember You, thank You, and worship You beautifully. (Abu Dawud)",
];
const VIRTUES = [
  'Five daily prayers wipe away sins between them — like bathing in a river five times a day. No dirt remains. (Bukhari & Muslim)',
  'The first thing judged on Judgment Day is your prayer. If good, everything is good. If neglected, everything suffers. (Tirmidhi)',
  "The closest you ever are to Allah is in Sujud (prostration). Make plenty of du'a there. (Muslim)",
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
};
const speak = (text, rate = 0.88) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate; u.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const pref = voices.find(v => v.lang.startsWith('en')) || voices[0];
  if (pref) u.voice = pref;
  window.speechSynthesis.speak(u);
};
const timeToMins = t => { if (!t || t === '--:--') return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const nowMins = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const formatMins = m => { const hh = Math.floor(m / 60); const mm = m % 60; return `${hh > 0 ? hh + 'h ' : ''}${mm}m`; };
const hhmm = () => { const n = new Date(); return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`; };
const minsBefore = (time, mins) => {
  const m = timeToMins(time) - mins;
  const w = ((m % 1440) + 1440) % 1440;
  return `${String(Math.floor(w / 60)).padStart(2, '0')}:${String(w % 60).padStart(2, '0')}`;
};
async function askNotifPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  return (await Notification.requestPermission()) === 'granted';
}
function pushNotif(title, body, tag) {
  if (Notification.permission !== 'granted') return;
  try {
    if (navigator.serviceWorker?.controller)
      navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIFICATION', title, body, tag, icon: '/pwa-192x192.png' });
    else new Notification(title, { body, tag, icon: '/pwa-192x192.png' });
  } catch { try { new Notification(title, { body, tag }); } catch { } }
}
const cleanTime = s => s?.replace(/ (AM|PM)/i, '').trim().padStart(5, '0') || '00:00';
async function fetchByCoords(lat, lng, method) {
  const ts = Math.floor(Date.now() / 1000);
  const res = await fetch(`https://api.aladhan.com/v1/timings/${ts}?latitude=${lat}&longitude=${lng}&method=${method}`);
  if (!res.ok) throw new Error('API error');
  const d = await res.json(); const t = d.data.timings;
  return { Fajr: cleanTime(t.Fajr), Dhuhr: cleanTime(t.Dhuhr), Asr: cleanTime(t.Asr), Maghrib: cleanTime(t.Maghrib), Isha: cleanTime(t.Isha), date: d.data.date.readable };
}
async function fetchByCity(city, country, method) {
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country || '')}&method=${method}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('City not found');
  const d = await res.json(); const t = d.data.timings;
  return { Fajr: cleanTime(t.Fajr), Dhuhr: cleanTime(t.Dhuhr), Asr: cleanTime(t.Asr), Maghrib: cleanTime(t.Maghrib), Isha: cleanTime(t.Isha), date: d.data.date.readable };
}

// ─── PARTICLES ────────────────────────────────────────────────────────────────
function Particles({ theme }) {
  const pts = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, dur: Math.random() * 7 + 5, delay: Math.random() * 3,
  })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pts.map(p => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: theme.accent, opacity: 0.1 }}
          animate={{ y: [0, -28, 0], opacity: [0.07, 0.18, 0.07] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

// ─── ? TOOLTIP ────────────────────────────────────────────────────────────────
function Tip({ text, theme }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <motion.button whileTap={{ scale: 0.88 }} onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
        style={{ background: `${theme.accent}22`, color: theme.accent }}>?</motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.85, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85 }}
            className="absolute z-50 right-0 top-7 w-56 p-3 rounded-2xl shadow-2xl text-xs font-bold leading-relaxed"
            style={{ background: theme.surface, color: theme.text, boxShadow: `0 8px 30px ${theme.glow}` }}
            onClick={() => setOpen(false)}>{text}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DOWNLOAD GATE  (FIRST SCREEN — blocks entire app until installed) ────────
// ═══════════════════════════════════════════════════════════════════════════════
const GATE_THEME = {
  bg: '#fdf6ee', surface: '#ffffff', accent: '#e27d60', text: '#2d2926', muted: '#9e8c84',
  gradient: 'linear-gradient(135deg,#e27d60,#c9513a)', glow: 'rgba(226,125,96,0.28)', overlay: 'rgba(226,125,96,0.09)',
};

const BENEFITS = [
  { icon: '🔔', title: 'Prayer Alerts on Your Lock Screen', desc: 'Get notified the moment each prayer begins — even when your phone is locked. Never miss Fajr again.' },
  { icon: '📍', title: 'Accurate Times for Your Exact City', desc: 'Live prayer times from the Aladhan API, fetched daily using your GPS. Mumbai, London, New York — all precise.' },
  { icon: '⏰', title: '30 & 15 Minute Warnings', desc: 'NUR warns you before a prayer window closes so you always have time to make wudu and pray.' },
  { icon: '🕌', title: 'Mosque Mode', desc: 'One tap silences all sounds and notifications so your phone never disturbs the congregation.' },
  { icon: '📖', title: 'Quran Reader Built In', desc: "Each prayer links to its recommended Surah — full Arabic text and English translation." },
  { icon: '🔥', title: 'Prayer Streak Tracker', desc: 'Track every prayer you complete. Build a streak. Watch your consistency grow with charts.' },
];

function DownloadGate({ onInstalled }) {
  const t = GATE_THEME;
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    // Already running as installed PWA → skip gate immediately
    const alreadyPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (alreadyPWA) { onInstalled(); return; }

    // iOS detection (Safari doesn't fire beforeinstallprompt)
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream);

    const h = e => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', h);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', h);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [onInstalled]);

  const handleInstall = async () => {
    if (!installPrompt) return;
    setInstalling(true);
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setInstalling(false);
    if (outcome === 'accepted') onInstalled();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ background: t.bg, fontFamily: 'Poppins, sans-serif' }}>
      <Particles theme={t} />

      <div className="relative z-10 flex flex-col items-center px-6 pt-14 pb-12 max-w-sm mx-auto w-full min-h-screen">

        {/* ── LOGO ── */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
          className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl mb-6 shadow-2xl"
          style={{ background: t.gradient, boxShadow: `0 16px 50px ${t.glow}` }}>
          🕌
        </motion.div>

        {/* ── HEADLINE ── */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="text-center mb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.55em] mb-2" style={{ color: t.accent }}>
            نور · Your Prayer Companion
          </p>
          <h1 className="text-6xl font-black tracking-tighter leading-none mb-3" style={{ color: t.text }}>NUR</h1>
          <p className="text-sm leading-relaxed" style={{ color: t.muted }}>
            Never miss a prayer. Get accurate times for your city, lock-screen reminders, a Quran reader, and a streak tracker — completely free.
          </p>
        </motion.div>

        {/* ── DIVIDER ── */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 }}
          className="w-full h-px my-6 opacity-15" style={{ background: t.text }} />

        {/* ── BENEFIT LIST ── */}
        <div className="w-full space-y-3 mb-8">
          {BENEFITS.map((b, i) => (
            <motion.div key={b.title}
              initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.32 + i * 0.07 }}
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ background: t.surface, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: t.overlay }}>
                {b.icon}
              </div>
              <div>
                <p className="font-black text-xs mb-0.5" style={{ color: t.text }}>{b.title}</p>
                <p className="text-[10px] leading-relaxed" style={{ color: t.muted }}>{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── INSTALL SECTION ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }} className="w-full">

          {/* Android / Chrome — native install button */}
          {!isIOS && installPrompt && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleInstall} disabled={installing}
              className="w-full py-5 rounded-[2rem] font-black text-white text-base flex items-center justify-center gap-3 mb-4"
              style={{ background: t.gradient, boxShadow: `0 10px 35px ${t.glow}` }}>
              {installing
                ? <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full" />
                  Installing…
                </>
                : <><Download size={20} /> Add NUR to Home Screen</>}
            </motion.button>
          )}

          {/* Android — prompt not ready yet */}
          {!isIOS && !installPrompt && (
            <div className="w-full py-5 rounded-[2rem] mb-4 flex items-center justify-center gap-3"
              style={{ background: `${t.accent}18` }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-t-transparent rounded-full" style={{ borderColor: t.accent }} />
              <p className="text-sm font-black" style={{ color: t.accent }}>Preparing install option…</p>
            </div>
          )}

          {/* iOS — manual steps */}
          {isIOS && (
            <>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowIOSSteps(o => !o)}
                className="w-full py-5 rounded-[2rem] font-black text-white text-base flex items-center justify-center gap-3 mb-3"
                style={{ background: t.gradient, boxShadow: `0 10px 35px ${t.glow}` }}>
                <Download size={20} /> How to Install on iPhone
              </motion.button>
              <AnimatePresence>
                {showIOSSteps && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl overflow-hidden mb-4" style={{ background: t.surface }}>
                    <div className="p-4 space-y-4">
                      {[
                        { n: '1', text: 'Tap the Share button at the bottom of Safari (the box with an arrow pointing up ↑)' },
                        { n: '2', text: 'Scroll down and tap "Add to Home Screen"' },
                        { n: '3', text: 'Tap "Add" in the top-right corner — NUR will appear on your home screen like a real app' },
                      ].map(s => (
                        <div key={s.n} className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                            style={{ background: t.gradient }}>{s.n}</div>
                          <p className="text-xs font-bold leading-relaxed pt-0.5" style={{ color: t.text }}>{s.text}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Badges */}
          <div className="flex items-center justify-center gap-5 mb-6">
            {['100% Free', 'No Account', 'No Ads'].map(label => (
              <div key={label} className="flex items-center gap-1">
                <Check size={10} style={{ color: t.accent }} />
                <span className="text-[9px] font-black" style={{ color: t.muted }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Already installed escape hatch */}
          <div className="text-center">
            <button onClick={onInstalled}
              className="text-[10px] font-bold underline"
              style={{ color: t.muted }}>
              I already installed it — open the app →
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── REST OF APP ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const TOUR = [
  { emoji: '🕌', title: 'Welcome to NUR', sub: 'نور means "Light" in Arabic', body: "NUR is your personal prayer companion. It shows you prayer times for your exact city, reminds you before each prayer, reads Islamic wisdom aloud, and tracks which prayers you've completed.", cta: "Let's Go →" },
  { emoji: '📍', title: 'Real Prayer Times', sub: 'From the Aladhan API — accurate to your city', body: 'Prayer times differ by city. Fajr in Mumbai is not the same as Fajr in London. NUR fetches accurate times daily using the free Aladhan.com prayer API based on your GPS or city name.', cta: 'Got it →' },
  { emoji: '🔔', title: 'Lock-Screen Alerts', sub: 'Never miss a prayer again', body: "NUR sends you a full-screen alert when it's prayer time — even when your phone is locked. It also warns you 30 and 15 minutes before a prayer window closes, so you never run out of time.", cta: 'Allow Notifications →', action: 'notif' },
  { emoji: '🕌', title: 'Mosque Mode', sub: 'One tap silences everything at the masjid', body: "If you're heading to the mosque, tap 🔔 in the footer to enable Mosque Mode. This silences all sounds and notifications so your phone doesn't disturb anyone. NUR re-enables after 2 hours automatically.", cta: 'Understood →' },
  { emoji: '📊', title: 'Prayer Streak', sub: 'Track your consistency', body: 'Every prayer you confirm gets logged. The 🔥 streak shows how many days in a row you prayed all 5 prayers. Tap the streak tile or "Prayer Tracker" button to see your full history chart.', cta: 'Nice →' },
  { emoji: '🧭', title: 'Calculation Method', sub: 'Which Islamic authority covers your region?', body: "Different Islamic organisations calculate prayer times slightly differently. Choose the one used in your country. If you're not sure, MWL (Muslim World League) works for most of the world.", cta: 'Choose & Continue →', action: 'method' },
];

function FirstLaunchTour({ theme, onComplete }) {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState(3);
  const [notifOk, setNotifOk] = useState(Notification?.permission === 'granted');
  const slide = TOUR[step];
  const isLast = step === TOUR.length - 1;
  const next = async () => {
    if (slide.action === 'notif') { const ok = await askNotifPermission(); setNotifOk(ok); }
    if (isLast) onComplete(method); else setStep(s => s + 1);
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[900] flex flex-col" style={{ background: theme.bg, fontFamily: 'Poppins, sans-serif' }}>
      <Particles theme={theme} />
      <div className="relative z-10 flex justify-center gap-2 pt-10 pb-4 shrink-0">
        {TOUR.map((_, i) => (
          <motion.div key={i} className="rounded-full h-1.5"
            animate={{ width: i === step ? 28 : 6, background: i <= step ? theme.accent : `${theme.accent}28` }}
            transition={{ duration: 0.3 }} />
        ))}
      </div>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 overflow-y-auto pb-6">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="flex flex-col items-center text-center w-full max-w-sm">
            <motion.div className="text-7xl mb-5" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>{slide.emoji}</motion.div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: theme.accent }}>{slide.sub}</p>
            <h2 className="text-4xl font-black tracking-tighter mb-4" style={{ color: theme.text }}>{slide.title}</h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: theme.muted }}>{slide.body}</p>
            {slide.action === 'notif' && notifOk && (
              <div className="flex items-center gap-2 w-full px-4 py-3 rounded-2xl mb-4" style={{ background: `${theme.accent}15` }}>
                <Check size={16} style={{ color: theme.accent }} /><p className="text-xs font-black" style={{ color: theme.accent }}>Notifications are ON ✓</p>
              </div>
            )}
            {slide.action === 'notif' && !notifOk && Notification?.permission === 'denied' && (
              <div className="flex items-start gap-2 w-full px-4 py-3 rounded-2xl mb-4" style={{ background: 'rgba(224,92,122,0.1)' }}>
                <AlertCircle size={16} style={{ color: '#e05c7a' }} className="shrink-0 mt-0.5" />
                <p className="text-xs font-bold" style={{ color: '#e05c7a' }}>Notifications are blocked. Go to phone Settings → NUR → Notifications to enable them.</p>
              </div>
            )}
            {slide.action === 'method' && (
              <div className="w-full space-y-2 mb-5 max-h-56 overflow-y-auto pr-1">
                {CALC_METHODS.map(m => (
                  <motion.button key={m.id} whileTap={{ scale: 0.97 }} onClick={() => setMethod(m.id)}
                    className="w-full p-3 rounded-2xl text-left border-2 transition-all"
                    style={{ background: method === m.id ? `${theme.accent}12` : 'transparent', borderColor: method === m.id ? theme.accent : `${theme.accent}20` }}>
                    <div className="flex items-center justify-between">
                      <div><p className="font-black text-sm" style={{ color: theme.text }}>{m.name}</p><p className="text-[9px] mt-0.5" style={{ color: theme.muted }}>{m.region}</p></div>
                      {method === m.id && <Check size={14} style={{ color: theme.accent }} />}
                    </div>
                    {method === m.id && <p className="text-[10px] mt-1.5" style={{ color: theme.muted }}>{m.desc}</p>}
                  </motion.button>
                ))}
              </div>
            )}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={next}
              className="w-full py-5 rounded-[2rem] font-black text-white text-base"
              style={{ background: theme.gradient, boxShadow: `0 8px 30px ${theme.glow}` }}>
              {isLast ? '🚀 Start NUR' : slide.cta}
            </motion.button>
            {step > 0 && <button onClick={() => setStep(s => s - 1)} className="mt-4 text-xs font-bold" style={{ color: theme.muted }}>← Back</button>}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function LocationSetup({ theme, method, onDone }) {
  const [phase, setPhase] = useState('idle');
  const [errMsg, setErrMsg] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const doCoords = async (lat, lng) => {
    setPhase('fetching');
    try { const times = await fetchByCoords(lat, lng, method); onDone({ lat, lng, times, source: 'gps' }); }
    catch { setPhase('error'); setErrMsg('Could not load prayer times. Please check your internet connection.'); }
  };
  const useGPS = () => {
    setPhase('locating');
    if (!navigator.geolocation) { setPhase('error'); setErrMsg("GPS not supported. Enter your city name."); setShowManual(true); return; }
    navigator.geolocation.getCurrentPosition(
      p => doCoords(p.coords.latitude, p.coords.longitude),
      () => { setPhase('error'); setErrMsg('Location access was denied. Enter your city name below.'); setShowManual(true); },
      { timeout: 10000 }
    );
  };
  const doCity = async () => {
    if (!city.trim()) return;
    setPhase('fetching');
    try { const times = await fetchByCity(city, country, method); onDone({ city, country, times, source: 'city' }); }
    catch { setPhase('error'); setErrMsg(`Couldn't find "${city}". Try a nearby major city name in English.`); }
  };
  const spinning = phase === 'locating' || phase === 'fetching';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[850] flex flex-col items-center justify-center px-8"
      style={{ background: theme.bg, fontFamily: 'Poppins, sans-serif' }}>
      <Particles theme={theme} />
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        <motion.div className="text-6xl mb-5"
          animate={spinning ? { rotate: 360 } : { scale: [1, 1.08, 1] }}
          transition={spinning ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 2, repeat: Infinity }}>
          {phase === 'error' ? '😕' : '📍'}
        </motion.div>
        <h2 className="text-3xl font-black tracking-tighter mb-2" style={{ color: theme.text }}>{spinning ? 'Please wait…' : 'Your City'}</h2>
        <p className="text-sm leading-relaxed mb-5" style={{ color: theme.muted }}>
          {phase === 'idle' ? 'NUR needs to know your city to show the correct prayer times. Your location is never stored or shared.' :
            phase === 'locating' ? 'Finding your location…' :
              phase === 'fetching' ? 'Downloading today\'s prayer times from Aladhan API…' : errMsg}
        </p>
        {spinning && <div className="flex gap-2">{[0, 1, 2].map(i => <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: theme.accent }} animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }} />)}</div>}
        {(phase === 'idle' || phase === 'error') && !showManual && (
          <div className="w-full space-y-3">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} onClick={useGPS}
              className="w-full py-5 rounded-[2rem] font-black text-white text-base"
              style={{ background: theme.gradient, boxShadow: `0 8px 30px ${theme.glow}` }}>📍 Use My Current Location</motion.button>
            <p className="text-xs" style={{ color: theme.muted }}>This asks your device for GPS coordinates. Fastest & most accurate.</p>
            <button onClick={() => setShowManual(true)} className="text-sm font-bold underline" style={{ color: theme.muted }}>I'd rather type my city name</button>
          </div>
        )}
        {showManual && (
          <div className="w-full space-y-3">
            <div className="text-left"><p className="text-[10px] font-black uppercase mb-1" style={{ color: theme.muted }}>City Name *</p>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai, London, New York"
                className="w-full p-4 rounded-2xl font-bold text-sm outline-none border-2 bg-transparent" style={{ borderColor: `${theme.accent}40`, color: theme.text }}
                onKeyDown={e => e.key === 'Enter' && doCity()} /></div>
            <div className="text-left"><p className="text-[10px] font-black uppercase mb-1" style={{ color: theme.muted }}>Country (optional)</p>
              <input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. India, UK, USA"
                className="w-full p-4 rounded-2xl font-bold text-sm outline-none border-2 bg-transparent" style={{ borderColor: `${theme.accent}40`, color: theme.text }}
                onKeyDown={e => e.key === 'Enter' && doCity()} /></div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} onClick={doCity}
              className="w-full py-5 rounded-[2rem] font-black text-white text-base"
              style={{ background: theme.gradient, boxShadow: `0 8px 30px ${theme.glow}` }}>Get My Prayer Times →</motion.button>
            <button onClick={useGPS} className="text-xs font-bold" style={{ color: theme.muted }}>Try GPS instead</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MosqueModeBanner({ theme, onDisable }) {
  return (
    <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
      className="relative z-20 mx-5 mt-2 rounded-[1.5rem] flex items-center justify-between px-4 py-3"
      style={{ background: 'linear-gradient(135deg,#1a7a4a,#0d5234)' }}>
      <div className="flex items-center gap-2">
        <span>🕌</span>
        <div><p className="text-[10px] font-black text-white">Mosque Mode is ON</p><p className="text-[8px] text-white/60">All sounds & notifications are silenced</p></div>
      </div>
      <motion.button whileTap={{ scale: 0.9 }} onClick={onDisable} className="px-3 py-1.5 rounded-xl text-[9px] font-black text-white border border-white/30">Turn Off</motion.button>
    </motion.div>
  );
}

function MosquePrompt({ prayer, theme, onYes, onNo, onDismiss }) {
  return (
    <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
      className="fixed inset-0 z-[460] flex items-end justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onDismiss} />
      <div className="relative w-full max-w-lg mx-auto rounded-t-[2.5rem] p-8 pb-12" style={{ background: theme.surface }}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: theme.gradient }}>🕌</div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: theme.accent }}>30 minutes until {prayer.name}</p>
            <h3 className="text-xl font-black" style={{ color: theme.text }}>Are you going to the mosque?</h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.muted }}>If yes, we'll silence all sounds and notifications so your phone doesn't disturb anyone. NUR turns back on after 2 hours.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={onYes}
            className="w-full py-4 rounded-[1.5rem] font-black text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#1a7a4a,#0d5234)', boxShadow: '0 6px 20px rgba(26,122,74,0.3)' }}>🕌 Yes — Enable Mosque Mode</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={onNo}
            className="w-full py-4 rounded-[1.5rem] font-black" style={{ background: theme.overlay, color: theme.text }}>🏠 No, Praying at Home</motion.button>
          <button onClick={onDismiss} className="text-xs font-bold py-2 text-center" style={{ color: theme.muted }}>Dismiss this reminder</button>
        </div>
      </div>
    </motion.div>
  );
}

function PrayerAlert({ prayer, theme, onPraying, onDismiss, silenced, endTime }) {
  const [cd, setCd] = useState(8);
  const fired = useRef(false);
  useEffect(() => {
    const t = setInterval(() => setCd(c => {
      if (c <= 1) { clearInterval(t); if (!fired.current && !silenced) { fired.current = true; speak([`It is time for ${prayer.name} prayer. `, HADITHS_ALERT[0] + ' ', HADITHS_ALERT[1] + ' ', HADITHS_ALERT[2]].join(''), 0.85); } return 0; }
      return c - 1;
    }), 1000);
    return () => { clearInterval(t); window.speechSynthesis?.cancel(); };
  }, [prayer.name, silenced]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center" style={{ background: theme.bg, fontFamily: 'Poppins, sans-serif' }}>
      <Particles theme={theme} />
      {silenced && <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-2 rounded-2xl" style={{ background: theme.overlay }}><VolumeX size={12} style={{ color: theme.muted }} /><span className="text-[9px] font-black" style={{ color: theme.muted }}>Mosque Mode</span></div>}
      <div className="relative mb-8">
        {[1, 2, 3].map(i => <motion.div key={i} className="absolute rounded-full border-2" style={{ borderColor: theme.accent, inset: -(i * 22), opacity: 0.12 }} animate={{ scale: [1, 1.18, 1], opacity: [0.12, 0.03, 0.12] }} transition={{ duration: 2.4, delay: i * 0.35, repeat: Infinity }} />)}
        <div className="w-28 h-28 rounded-full flex items-center justify-center text-5xl relative z-10" style={{ background: theme.gradient, boxShadow: `0 0 60px ${theme.glow}` }}>{PRAYER_META[prayer.name]?.icon || '🕌'}</div>
      </div>
      <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-2" style={{ color: theme.accent }}>It's Prayer Time!</p>
      <h2 className="text-6xl font-black tracking-tighter mb-1" style={{ color: theme.text }}>{prayer.name}</h2>
      <p className="font-bold text-base mb-1" style={{ color: theme.muted }}>{prayer.time}</p>
      {endTime && <p className="text-xs font-bold mb-5 px-4 py-2 rounded-xl" style={{ background: theme.overlay, color: theme.muted }}>⏱ Window closes at {endTime} — please pray before then</p>}
      {cd > 0
        ? <div className="flex flex-col items-center mb-6"><p className="text-xs mb-2" style={{ color: theme.muted }}>{silenced ? 'Mosque Mode — Sound Off' : 'Voice reminder starts in'}</p><motion.p className="text-5xl font-black" style={{ color: theme.accent }} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1, repeat: Infinity }}>{cd}</motion.p></div>
        : <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm mb-6 flex items-center gap-2" style={{ color: theme.accent }}>{silenced ? <><VolumeX size={14} /> Mosque Mode — Audio Silenced</> : <><motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.7, repeat: Infinity }}>🔊</motion.span> Reading 3 hadiths aloud…</>}</motion.p>}
      <div className="w-full max-w-xs px-6 flex flex-col gap-3">
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} onClick={onPraying}
          className="w-full py-5 rounded-[2rem] font-black text-white text-lg flex items-center justify-center gap-2"
          style={{ background: theme.gradient, boxShadow: `0 8px 30px ${theme.glow}` }}><Check size={22} /> I Am Praying Now</motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={onDismiss}
          className="w-full py-4 rounded-[2rem] font-bold text-sm" style={{ background: theme.overlay, color: theme.muted }}>Dismiss (I'll pray later)</motion.button>
      </div>
    </motion.div>
  );
}

function DuaScreen({ prayer, theme, onClose, silenced }) {
  const [phase, setPhase] = useState('dua');
  const di = useMemo(() => Math.floor(Math.random() * DUAS.length), []);
  const vi = useMemo(() => Math.floor(Math.random() * VIRTUES.length), []);
  useEffect(() => {
    if (silenced) return;
    if (phase === 'dua') speak(`MashaAllah! May Allah accept your ${prayer.name}. ${DUAS[di]}`, 0.88);
    else if (phase === 'virtue') speak(VIRTUES[vi], 0.88);
    return () => window.speechSynthesis?.cancel();
  }, [phase, silenced]);
  if (phase === 'done') return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex flex-col items-center justify-center" style={{ background: theme.bg, fontFamily: 'Poppins, sans-serif' }}>
      <Particles theme={theme} />
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }} className="flex flex-col items-center text-center px-8">
        <div className="text-7xl mb-5">🌟</div>
        <h2 className="text-4xl font-black mb-2" style={{ color: theme.text }}>MashaAllah!</h2>
        <p className="text-base mb-8 max-w-xs" style={{ color: theme.muted }}>May Allah accept your {prayer.name} prayer and write it in your book of deeds. Ameen.</p>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="px-10 py-4 rounded-[2rem] font-black text-white" style={{ background: theme.gradient, boxShadow: `0 8px 30px ${theme.glow}` }}>Ameen 🤲</motion.button>
      </motion.div>
    </motion.div>
  );
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed inset-0 z-[500] flex flex-col items-center justify-center px-8" style={{ background: theme.bg, fontFamily: 'Poppins, sans-serif' }}>
      <Particles theme={theme} />
      <motion.div key={phase} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center max-w-sm relative z-10">
        <motion.div className="text-5xl mb-4" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>{phase === 'dua' ? '🤲' : '✨'}</motion.div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-1" style={{ color: theme.accent }}>{phase === 'dua' ? 'Post-Prayer Dhikr' : 'Why Prayer Matters'}</p>
        <p className="text-[10px] mb-3" style={{ color: theme.muted }}>{phase === 'dua' ? 'Recite these after your prayer to multiply your reward' : 'A reminder of the power of your prayer'}</p>
        <div className="p-5 rounded-[1.5rem] mb-4 text-left" style={{ background: theme.surface }}><p className="text-sm font-bold leading-relaxed" style={{ color: theme.text }}>{phase === 'dua' ? DUAS[di] : VIRTUES[vi]}</p></div>
        {!silenced && <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }} onClick={() => speak(phase === 'dua' ? DUAS[di] : VIRTUES[vi])} className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black mb-4" style={{ background: theme.overlay, color: theme.accent }}><Volume2 size={13} /> Read aloud</motion.button>}
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} onClick={() => setPhase(phase === 'dua' ? 'virtue' : 'done')} className="w-full py-5 rounded-[2rem] font-black text-white text-base" style={{ background: theme.gradient, boxShadow: `0 8px 30px ${theme.glow}` }}>{phase === 'dua' ? 'Next: Why Prayer Matters →' : 'Done ✓'}</motion.button>
      </motion.div>
    </motion.div>
  );
}

function FollowUp({ prayer, theme, onYes, onNo }) {
  return (
    <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }} className="fixed inset-0 z-[450] flex items-end justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onNo} />
      <div className="relative w-full max-w-lg mx-auto rounded-t-[2.5rem] p-8 pb-12" style={{ background: theme.surface }}>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: theme.gradient }}>{PRAYER_META[prayer.name]?.icon || '🕌'}</div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: theme.accent }}>Quick check • 15 min ago</p>
            <h3 className="text-xl font-black" style={{ color: theme.text }}>Did you pray {prayer.name}?</h3>
            <p className="text-xs mt-0.5" style={{ color: theme.muted }}>Tap yes to log it in your Prayer Tracker</p>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} onClick={onYes} className="flex-1 py-4 rounded-[1.5rem] font-black text-white flex items-center justify-center gap-2" style={{ background: theme.gradient, boxShadow: `0 6px 20px ${theme.glow}` }}><Check size={18} /> Yes, Alhamdulillah!</motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} onClick={onNo} className="flex-1 py-4 rounded-[1.5rem] font-black" style={{ background: theme.overlay, color: theme.muted }}>Not yet</motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function Tracker({ prayerLog, theme, onClose }) {
  const today = new Date().toDateString();
  const todayLog = prayerLog[today] || {};
  const total = Object.values(prayerLog).reduce((s, d) => s + Object.values(d).filter(Boolean).length, 0);
  const full = Object.values(prayerLog).filter(d => Object.values(d).filter(Boolean).length === 5).length;
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const key = d.toDateString(); return { label: d.toLocaleDateString('en', { weekday: 'short' }), count: Object.values(prayerLog[key] || {}).filter(Boolean).length, key }; });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex flex-col" style={{ background: theme.bg, fontFamily: 'Poppins, sans-serif' }}>
      <Particles theme={theme} />
      <div className="relative z-10 p-7 flex justify-between items-center shrink-0">
        <div><h3 className="text-3xl font-black tracking-tighter" style={{ color: theme.text }}>Prayer Tracker</h3><p className="text-xs font-bold" style={{ color: theme.muted }}>Your journey — every prayer counts</p></div>
        <motion.button whileTap={{ scale: 0.88, rotate: 90 }} onClick={onClose} className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: theme.overlay }}><X size={20} style={{ color: theme.text }} /></motion.button>
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-10 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[{ icon: '🔥', val: full, label: 'Perfect Days' }, { icon: '📅', val: Object.keys(prayerLog).length, label: 'Days Tracked' }, { icon: '⭐', val: total, label: 'Total Prayers' }].map(s => (
            <motion.div key={s.label} whileHover={{ scale: 1.06, y: -3 }} className="rounded-[1.5rem] p-4 flex flex-col items-center" style={{ background: theme.surface }}>
              <span className="text-2xl mb-1">{s.icon}</span>
              <p className="text-2xl font-black" style={{ color: theme.accent }}>{s.val}</p>
              <p className="text-[8px] font-bold uppercase text-center" style={{ color: theme.muted }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="rounded-[2rem] p-5" style={{ background: theme.surface }}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.muted }}>Last 7 Days</p>
            <p className="text-[9px]" style={{ color: theme.muted }}>🔥 = all 5 prayers</p>
          </div>
          <div className="flex items-end justify-between gap-2" style={{ height: 90 }}>
            {last7.map(d => (
              <div key={d.key} className="flex flex-col items-center flex-1 gap-1 h-full justify-end">
                <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max((d.count / 5) * 70, d.count > 0 ? 8 : 4)}px` }} transition={{ type: 'spring', stiffness: 200 }} className="w-full rounded-t-xl" style={{ background: d.count === 5 ? theme.gradient : theme.accent, opacity: d.count === 0 ? 0.15 : 1 }} />
                <span className="text-[8px] font-bold" style={{ color: theme.muted }}>{d.label}</span>
                <span className="text-[8px] font-black" style={{ color: d.count === 5 ? theme.accent : theme.muted }}>{d.count}/5</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] p-5" style={{ background: theme.surface }}>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.muted }}>Today's Prayers</p>
            <Tip theme={theme} text="A checkmark ✓ means you've confirmed this prayer. Tap 'I Am Praying' on the alert to log it." />
          </div>
          <div className="space-y-2">
            {ACTIVE_PRAYERS.map(name => {
              const prayed = todayLog[name]; const meta = PRAYER_META[name];
              return (
                <motion.div key={name} whileHover={{ x: 4 }} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: `${theme.accent}12` }}>
                  <div className="flex items-center gap-3"><span className="text-xl">{meta.icon}</span><p className="font-bold text-sm" style={{ color: theme.text }}>{name}</p></div>
                  <AnimatePresence mode="wait">
                    {prayed
                      ? <motion.div key="y" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.gradient }}><Check size={14} color="#fff" /></motion.div>
                      : <motion.div key="n" className="w-8 h-8 rounded-full border-2" style={{ borderColor: `${theme.accent}30` }} />}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-4 rounded-2xl p-3 flex items-center justify-between" style={{ background: theme.overlay }}>
            <p className="text-xs font-black" style={{ color: theme.text }}>Today's Progress</p>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: `${theme.accent}20` }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${(Object.values(todayLog).filter(Boolean).length / 5) * 100}%` }} transition={{ duration: 0.8, type: 'spring' }} className="h-full rounded-full" style={{ background: theme.gradient }} />
              </div>
              <span className="text-xs font-black" style={{ color: theme.accent }}>{Object.values(todayLog).filter(Boolean).length}/5</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function QuranReader({ prayer, theme, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const meta = PRAYER_META[prayer.name];
  useEffect(() => {
    if (!meta?.surahId) { setLoading(false); return; }
    fetch(`https://api.alquran.cloud/v1/surah/${meta.surahId}/editions/quran-uthmani,en.sahih`)
      .then(r => r.json()).then(d => { setData(d.data[0].ayahs.map((a, i) => ({ arabic: a.text, english: d.data[1].ayahs[i].text, n: a.numberInSurah }))); setLoading(false); }).catch(() => setLoading(false));
  }, [meta?.surahId]);
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 220 }} className="fixed inset-0 z-[200] flex flex-col" style={{ background: theme.bg, fontFamily: 'Poppins, sans-serif' }}>
      <div className="p-7 flex justify-between items-center shrink-0 border-b" style={{ borderColor: `${theme.accent}18` }}>
        <div><p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: theme.accent }}>Recommended Surah for {prayer.name}</p><h3 className="text-3xl font-black tracking-tighter" style={{ color: theme.text }}>{meta?.surahName}</h3><p className="text-[10px] mt-0.5" style={{ color: theme.muted }}>Arabic above · English translation below each verse</p></div>
        <motion.button whileTap={{ scale: 0.88, rotate: 90 }} onClick={onClose} className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: theme.overlay }}><X size={20} style={{ color: theme.text }} /></motion.button>
      </div>
      <div className="flex-1 overflow-y-auto px-7 pb-20">
        {loading ? <div className="flex justify-center items-center h-40"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 rounded-full border-2 border-t-transparent" style={{ borderColor: theme.accent }} /></div>
          : data.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5) }} className="mb-10 pb-8 border-b" style={{ borderColor: `${theme.accent}12` }}>
              <div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black text-white" style={{ background: theme.gradient }}>{a.n}</div><p className="text-[9px]" style={{ color: theme.muted }}>Verse {a.n}</p></div>
              <p className="text-5xl text-right font-bold leading-[2.6] mb-5 select-text" dir="rtl" style={{ color: theme.accent, fontFamily: "'Scheherazade New','Amiri',serif" }}>{a.arabic}</p>
              <p className="text-base font-bold leading-relaxed italic" style={{ color: theme.muted }}>{a.english}</p>
            </motion.div>
          ))}
      </div>
    </motion.div>
  );
}

function ThemePicker({ current, onChange, onClose, theme }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-end" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-auto rounded-t-[2.5rem] p-7 pb-12 shadow-2xl" style={{ background: theme.surface }}>
        <div className="flex justify-between items-start mb-1">
          <div><p className="font-black text-sm uppercase tracking-widest" style={{ color: theme.muted }}>App Theme</p><p className="text-xs" style={{ color: theme.muted }}>Choose the colour style you prefer</p></div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: theme.overlay }}><X size={15} style={{ color: theme.text }} /></motion.button>
        </div>
        <div className="grid grid-cols-5 gap-4 mt-5">
          {Object.entries(THEMES).map(([key, t]) => (
            <motion.button key={key} whileHover={{ scale: 1.14, y: -5 }} whileTap={{ scale: 0.9 }} onClick={() => { onChange(key); onClose(); }} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl" style={{ background: t.gradient, boxShadow: current === key ? `0 4px 18px ${t.glow}` : 'none', outline: current === key ? `3px solid ${t.accent}` : '3px solid transparent', outlineOffset: 2, transition: 'all 0.2s' }} />
              <span className="text-[9px] font-black uppercase" style={{ color: current === key ? t.accent : '#aaa' }}>{t.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  // ── Gate: check if user has passed download screen ──
  const [gateCleared, setGateCleared] = useState(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    return isPWA;
  });

  const handleGateCleared = useCallback(() => {
    LS.set('nur_gate_cleared', true);
    setGateCleared(true);
  }, []);

  const [themeName, setThemeName] = useState(() => LS.get('nur_theme', 'terracotta'));
  const [prayerLog, setPrayerLog] = useState(() => LS.get('nur_prayerlog', {}));
  const [mosqueModeUntil, setMosqueModeUntil] = useState(() => LS.get('nur_mosque_until', 0));
  const [calcMethod, setCalcMethod] = useState(() => LS.get('nur_method', 3));
  const [locationData, setLocationData] = useState(() => LS.get('nur_location', null));
  const [prayerTimes, setPrayerTimes] = useState(() => LS.get('nur_times', null));
  const [timesDate, setTimesDate] = useState(() => LS.get('nur_times_date', ''));
  const [showTour, setShowTour] = useState(() => !LS.get('nur_onboarded', false));
  const [showLocSetup, setShowLocSetup] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [readingPrayer, setReadingPrayer] = useState(null);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [timesError, setTimesError] = useState(false);
  const [prayerAlert, setPrayerAlert] = useState(null);
  const [showDua, setShowDua] = useState(null);
  const [followUp, setFollowUp] = useState(null);
  const [mosquePrompt, setMosquePrompt] = useState(null);

  const theme = THEMES[themeName];
  const silenced = Date.now() < mosqueModeUntil;
  const fuTimers = useRef({});
  const fired = useRef(new Set());

  useEffect(() => { LS.set('nur_theme', themeName); }, [themeName]);
  useEffect(() => { LS.set('nur_prayerlog', prayerLog); }, [prayerLog]);
  useEffect(() => { LS.set('nur_mosque_until', mosqueModeUntil); }, [mosqueModeUntil]);
  useEffect(() => { LS.set('nur_method', calcMethod); }, [calcMethod]);

  useEffect(() => {
    const today = new Date().toDateString();
    if (prayerTimes && timesDate === today) return;
    if (!locationData) return;
    doRefresh(locationData);
  }, []);

  const doRefresh = async (loc) => {
    setLoadingTimes(true); setTimesError(false);
    try {
      let times;
      if (loc.lat) times = await fetchByCoords(loc.lat, loc.lng, calcMethod);
      else times = await fetchByCity(loc.city, loc.country, calcMethod);
      setPrayerTimes(times);
      const today = new Date().toDateString();
      setTimesDate(today); LS.set('nur_times', times); LS.set('nur_times_date', today);
    } catch { setTimesError(true); }
    setLoadingTimes(false);
  };

  const prayerList = useMemo(() => {
    if (!prayerTimes) return [];
    return ACTIVE_PRAYERS.map((name, i) => ({ name, icon: PRAYER_META[name].icon, time: prayerTimes[name] || '--:--', endTime: prayerTimes[ACTIVE_PRAYERS[(i + 1) % ACTIVE_PRAYERS.length]] || '--:--', surahId: PRAYER_META[name].surahId, surahName: PRAYER_META[name].surahName }));
  }, [prayerTimes]);

  const { upcoming, current, minsUntil } = useMemo(() => {
    const now = nowMins();
    if (!prayerList.length) return { upcoming: null, current: null, minsUntil: 0 };
    let up = prayerList.find(p => timeToMins(p.time) > now) || prayerList[0];
    let cur = null;
    for (const p of prayerList) {
      const s = timeToMins(p.time), e = timeToMins(p.endTime);
      if (e > s) { if (now >= s && now < e) { cur = p; break; } } else { if (now >= s || now < e) { cur = p; break; } }
    }
    let diff = timeToMins(up.time) - now; if (diff < 0) diff += 1440;
    return { upcoming: up, current: cur, minsUntil: diff };
  }, [prayerList]);

  useEffect(() => {
    if (!prayerList.length) return;
    const check = () => {
      const now = hhmm();
      prayerList.forEach(p => {
        if (p.time === now && !fired.current.has(`s-${now}-${p.name}`)) { fired.current.add(`s-${now}-${p.name}`); setTimeout(() => fired.current.delete(`s-${now}-${p.name}`), 120000); if (!silenced) pushNotif(`🕌 ${p.name} Time`, `Window: ${p.time} – ${p.endTime}`, `start-${p.name}`); setPrayerAlert(p); }
        const m30 = minsBefore(p.time, 30); if (m30 === now && !fired.current.has(`mp-${now}-${p.name}`)) { fired.current.add(`mp-${now}-${p.name}`); setTimeout(() => fired.current.delete(`mp-${now}-${p.name}`), 120000); if (!silenced) setMosquePrompt(p); }
        const e30 = minsBefore(p.endTime, 30); if (e30 === now && !fired.current.has(`e30-${now}-${p.name}`)) { fired.current.add(`e30-${now}-${p.name}`); setTimeout(() => fired.current.delete(`e30-${now}-${p.name}`), 120000); if (!silenced) pushNotif(`⏰ ${p.name} — 30 min left`, `Window closes at ${p.endTime}.`, `e30-${p.name}`); }
        const e15 = minsBefore(p.endTime, 15); if (e15 === now && !fired.current.has(`e15-${now}-${p.name}`)) { fired.current.add(`e15-${now}-${p.name}`); setTimeout(() => fired.current.delete(`e15-${now}-${p.name}`), 120000); if (!silenced) pushNotif(`⚠️ ${p.name} ending in 15 min!`, `Last chance — closes at ${p.endTime}`, `e15-${p.name}`); }
      });
    };
    check(); const iv = setInterval(check, 30000); return () => clearInterval(iv);
  }, [prayerList, silenced]);

  const markPrayed = useCallback((name) => {
    const today = new Date().toDateString();
    setPrayerLog(prev => { const u = { ...prev, [today]: { ...(prev[today] || {}), [name]: true } }; LS.set('nur_prayerlog', u); return u; });
  }, []);

  const scheduleFU = useCallback((p) => {
    if (fuTimers.current[p.name]) return;
    fuTimers.current[p.name] = setTimeout(() => {
      const log = LS.get('nur_prayerlog', {});
      if (!log[new Date().toDateString()]?.[p.name]) { if (!silenced) pushNotif(`Did you pray ${p.name}? 🤲`, 'Tap to log your prayer', `fu-${p.name}`); setFollowUp(p); }
      delete fuTimers.current[p.name];
    }, 15 * 60 * 1000);
  }, [silenced]);

  const enableMosque = () => { const u = Date.now() + 2 * 60 * 60 * 1000; setMosqueModeUntil(u); LS.set('nur_mosque_until', u); setMosquePrompt(null); window.speechSynthesis?.cancel(); };

  const dayOfYear = useMemo(() => Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000), []);
  const hadith = reminders[dayOfYear % reminders.length];
  const hadithIdx = dayOfYear % reminders.length;

  const { streak, todayCount } = useMemo(() => {
    const today = new Date().toDateString();
    const tc = Object.values(prayerLog[today] || {}).filter(Boolean).length;
    let s = 0; for (let i = 0; i < 365; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (Object.values(prayerLog[d.toDateString()] || {}).filter(Boolean).length === 5) s++; else if (i > 0) break; }
    return { streak: s, todayCount: tc };
  }, [prayerLog]);

  const todayLog = prayerLog[new Date().toDateString()] || {};
  const methodName = CALC_METHODS.find(m => m.id === calcMethod)?.name || 'MWL';

  // ── Render download gate FIRST — nothing else shows until installed ──
  if (!gateCleared) {
    return (
      <>
        <FontLoader />
        <DownloadGate onInstalled={handleGateCleared} />
      </>
    );
  }

  return (
    <>
      <FontLoader />
      <div className="h-screen w-full max-w-lg mx-auto flex flex-col overflow-hidden relative"
        style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: 'Poppins, sans-serif' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 85% 5%, ${theme.glow} 0%, transparent 55%), radial-gradient(ellipse at 15% 95%, ${theme.overlay} 0%, transparent 55%)` }} />

        <AnimatePresence>{silenced && <MosqueModeBanner key="mb" theme={theme} onDisable={() => setMosqueModeUntil(0)} />}</AnimatePresence>

        {/* HEADER */}
        <header className="relative z-10 flex justify-between items-center px-5 pt-6 pb-2 shrink-0">
          <div>
            <h1 className="text-5xl font-black tracking-tighter leading-none" style={{ color: theme.text }}>NUR</h1>
            <div className="flex gap-1.5 mt-1.5">
              <div className="h-1 w-10 rounded-full" style={{ background: theme.gradient }} />
              <div className="h-1 w-3 rounded-full opacity-20" style={{ backgroundColor: theme.text }} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
              onClick={() => locationData ? doRefresh(locationData) : setShowLocSetup(true)}
              disabled={loadingTimes} title="Refresh prayer times"
              className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: theme.overlay }}>
              <motion.div animate={loadingTimes ? { rotate: 360 } : { rotate: 0 }} transition={loadingTimes ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}>
                <RefreshCw size={15} style={{ color: timesError ? '#e05c7a' : theme.accent }} />
              </motion.div>
            </motion.button>
            <motion.button whileHover={{ scale: 1.1, rotate: 20 }} whileTap={{ scale: 0.88, rotate: -10 }}
              onClick={() => setShowThemes(true)} title="Change app colour theme"
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: theme.surface, boxShadow: `0 4px 18px ${theme.glow}` }}>
              <Palette size={17} style={{ color: theme.accent }} />
            </motion.button>
          </div>
        </header>

        {/* UPCOMING PRAYER CARD */}
        <div className="relative z-10 mx-5 mb-3 shrink-0">
          {!prayerTimes ? (
            <motion.div whileHover={{ scale: 1.01 }} onClick={() => setShowLocSetup(true)}
              className="rounded-[2rem] p-5 flex items-center gap-4 cursor-pointer"
              style={{ background: theme.gradient, boxShadow: `0 8px 30px ${theme.glow}` }}>
              <div className="text-4xl">📍</div>
              <div><p className="text-white/70 text-[9px] font-black uppercase tracking-widest">Setup Needed</p><p className="text-white font-black text-lg">Tap to enter your city</p><p className="text-white/60 text-xs">We need your city to show prayer times</p></div>
            </motion.div>
          ) : timesError ? (
            <motion.div className="rounded-[2rem] p-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg,#e05c7a,#b83d5c)' }}>
              <AlertCircle size={28} color="white" />
              <div><p className="text-white font-black">Couldn't load prayer times</p><p className="text-white/70 text-xs">Check your internet and tap 🔄 in the header</p></div>
            </motion.div>
          ) : loadingTimes ? (
            <div className="rounded-[2rem] p-5 flex items-center gap-4" style={{ background: theme.gradient, boxShadow: `0 8px 30px ${theme.glow}` }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><RefreshCw size={28} color="white" /></motion.div>
              <p className="text-white font-black">Getting today's prayer times…</p>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.01 }} className="rounded-[2rem] p-5 relative overflow-hidden" style={{ background: theme.gradient, boxShadow: `0 8px 30px ${theme.glow}` }}>
              <div className="absolute right-0 top-0 w-36 h-36 rounded-full bg-white/10" style={{ transform: 'translate(30%,-30%)' }} />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60 mb-1">{current ? '🟢 Active Now' : '⏳ Next Prayer'}</p>
                  <h2 className="text-4xl font-black tracking-tighter text-white">{(current || upcoming)?.name}</h2>
                  <p className="text-white/80 font-bold text-sm mt-1">{current ? `${current.time} — closes ${current.endTime}` : `Starts in ${formatMins(minsUntil)} · at ${upcoming?.time}`}</p>
                  <p className="text-white/40 text-[9px] mt-0.5">{prayerTimes?.date} · {methodName}</p>
                </div>
                <div className="text-5xl">{PRAYER_META[(current || upcoming)?.name]?.icon || '🕌'}</div>
              </div>
              {!current && upcoming && (
                <div className="relative z-10 mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/20"><motion.div className="h-full rounded-full bg-white/80" animate={{ width: `${Math.min(Math.max(100 - (minsUntil / 120) * 100, 2), 100)}%` }} transition={{ duration: 1 }} /></div>
                  <span className="text-[9px] font-black text-white/60">{formatMins(minsUntil)}</span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* BENTO GRID */}
        <div className="relative z-10 flex-1 grid grid-cols-6 gap-3 px-5 pb-2 overflow-hidden" style={{ gridTemplateRows: 'repeat(5,1fr)' }}>

          {/* HADITH */}
          <motion.div whileHover={{ scale: 1.015 }}
            className="col-span-6 row-span-2 rounded-[2.5rem] p-5 relative overflow-hidden flex flex-col justify-center items-center text-center"
            style={{ background: theme.surface, boxShadow: `0 4px 30px ${theme.overlay}` }}>
            <div className="absolute right-0 top-0 w-48 h-48 rounded-full" style={{ background: theme.gradient, opacity: 0.05, transform: 'translate(35%,-35%)' }} />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={11} style={{ color: theme.accent }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: theme.accent }}>Today's Hadith #{hadithIdx + 1}</span>
              <Tip theme={theme} text="A different saying of the Prophet ﷺ is shown here every day. Tap the 🔊 button to hear it read aloud." />
            </div>
            <p className="text-[13px] font-black leading-tight italic mb-2 px-2" style={{ color: theme.text }}>"{hadith.en}"</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-4 opacity-20" style={{ background: theme.text }} />
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: theme.muted }}>{hadith.source}</p>
              <div className="h-px w-4 opacity-20" style={{ background: theme.text }} />
            </div>
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => !silenced && speak(`Hadith number ${hadithIdx + 1}. ${hadith.en}. Source: ${hadith.source}.`)}
              title={silenced ? "Sound is off (Mosque Mode)" : "Tap to hear this hadith read aloud"}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black"
              style={{ background: theme.overlay, color: silenced ? theme.muted : theme.accent }}>
              {silenced ? <VolumeX size={10} /> : <Volume2 size={10} />}{silenced ? 'Silenced' : 'Hear aloud'}
            </motion.button>
          </motion.div>

          {/* PRAYER TILES */}
          {prayerList.map((prayer, i) => {
            const prayed = todayLog[prayer.name]; const isWide = i >= 3;
            return (
              <motion.div key={prayer.name} whileHover={{ y: -5, scale: 1.03 }} whileTap={{ scale: 0.93 }}
                onClick={() => setReadingPrayer(prayer)}
                className={`${isWide ? 'col-span-3' : 'col-span-2'} row-span-2 rounded-[2rem] p-4 flex flex-col justify-between cursor-pointer relative overflow-hidden`}
                style={{ background: theme.surface }} title={`Tap to read ${prayer.surahName}`}>
                <motion.div className="absolute inset-0 rounded-[2rem]" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} style={{ background: theme.gradient }} transition={{ duration: 0.18 }} />
                {prayed && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }} className="absolute top-3 right-3 z-10 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: theme.gradient }}><Check size={10} color="#fff" /></motion.div>}
                <div className="relative z-10 flex justify-between items-start"><span className="text-[9px] font-black uppercase opacity-50">{prayer.name}</span><span className="text-base">{prayer.icon}</span></div>
                <div className="relative z-10"><p className="text-xl font-black tracking-tighter">{prayer.time}</p><p className="text-[8px] font-bold opacity-40 mt-0.5 flex items-center gap-1"><BookOpen size={7} /> {prayer.surahName}</p></div>
              </motion.div>
            );
          })}

          {/* LANGUAGE */}
          <motion.div whileHover={{ scale: 1.04 }} className="col-span-3 row-span-1 rounded-[1.5rem] flex items-center gap-2 px-4" style={{ background: theme.overlay }}>
            <Globe size={12} style={{ color: theme.accent }} />
            <select value="en" className="bg-transparent font-black text-[10px] uppercase outline-none w-full cursor-pointer" style={{ color: theme.text }}><option value="en">English</option></select>
          </motion.div>

          {/* STREAK */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowTracker(true)}
            className="col-span-3 row-span-1 rounded-[1.5rem] flex items-center justify-center gap-2 cursor-pointer overflow-hidden relative"
            style={{ background: theme.surface }} title="Tap to see your full prayer history">
            <motion.div className="absolute inset-0" style={{ background: theme.gradient, opacity: 0 }} whileHover={{ opacity: 0.08 }} />
            <motion.span animate={{ scale: [1, 1.35, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>🔥</motion.span>
            <div><p className="text-[10px] font-black leading-tight" style={{ color: theme.accent }}>{streak} Day Streak</p><p className="text-[8px] font-bold" style={{ color: theme.muted }}>{todayCount}/5 today · tap to see</p></div>
          </motion.div>
        </div>

        {/* FOOTER */}
        <div className="relative z-10 px-5 pb-7 pt-2 shrink-0 flex gap-3">
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
            onClick={() => silenced ? setMosqueModeUntil(0) : enableMosque()}
            title={silenced ? "Mosque Mode ON — tap to turn off" : "Enable Mosque Mode — silences for 2 hours"}
            className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5"
            style={{ background: silenced ? '#1a7a4a' : theme.surface, boxShadow: `0 4px 15px ${theme.overlay}` }}>
            <span className="text-xl">{silenced ? '🕌' : '🔔'}</span>
            <span className="text-[7px] font-black" style={{ color: silenced ? '#fff' : theme.muted }}>{silenced ? 'Mosque' : 'Alerts'}</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98, y: 0 }}
            onClick={() => setShowTracker(true)}
            className="relative flex-1 py-5 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] text-white overflow-hidden"
            style={{ background: theme.gradient, boxShadow: `0 8px 25px ${theme.glow}40` }}>
            <motion.div initial={{ x: '-100%', skewX: -45 }} whileHover={{ x: '200%' }} transition={{ duration: 0.8, ease: 'easeInOut' }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
            <div className="absolute inset-0 rounded-[2.5rem] border border-white/20 pointer-events-none" />
            <span className="relative z-10 flex items-center justify-center gap-2">Prayer Tracker <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}>✦</motion.span></span>
          </motion.button>
        </div>
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>
        {showTour && <FirstLaunchTour key="tour" theme={theme} onComplete={method => { setCalcMethod(method); LS.set('nur_method', method); LS.set('nur_onboarded', true); setShowTour(false); setShowLocSetup(true); }} />}
        {showLocSetup && <LocationSetup key="loc" theme={theme} method={calcMethod} onDone={loc => { setLocationData(loc); LS.set('nur_location', loc); setPrayerTimes(loc.times); LS.set('nur_times', loc.times); LS.set('nur_times_date', new Date().toDateString()); setShowLocSetup(false); }} />}
        {showThemes && <ThemePicker key="tp" current={themeName} onChange={setThemeName} onClose={() => setShowThemes(false)} theme={theme} />}
        {showTracker && <Tracker key="tr" prayerLog={prayerLog} theme={theme} onClose={() => setShowTracker(false)} />}
        {readingPrayer && <QuranReader key="qr" prayer={readingPrayer} theme={theme} onClose={() => setReadingPrayer(null)} />}
        {mosquePrompt && !silenced && <MosquePrompt key="mp" prayer={mosquePrompt} theme={theme} onYes={enableMosque} onNo={() => setMosquePrompt(null)} onDismiss={() => setMosquePrompt(null)} />}
        {prayerAlert && <PrayerAlert key="pa" prayer={prayerAlert} theme={theme} silenced={silenced} endTime={prayerAlert.endTime}
          onPraying={() => { window.speechSynthesis?.cancel(); setPrayerAlert(null); markPrayed(prayerAlert.name); scheduleFU(prayerAlert); setShowDua(prayerAlert); }}
          onDismiss={() => { setPrayerAlert(null); scheduleFU(prayerAlert); }} />}
        {showDua && <DuaScreen key="dua" prayer={showDua} theme={theme} silenced={silenced} onClose={() => setShowDua(null)} />}
        {followUp && <FollowUp key="fu" prayer={followUp} theme={theme}
          onYes={() => { markPrayed(followUp.name); setFollowUp(null); if (!silenced) speak(`MashaAllah! May Allah accept your ${followUp.name} prayer. Ameen.`); }}
          onNo={() => setFollowUp(null)} />}
      </AnimatePresence>
    </>
  );
}