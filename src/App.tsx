import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import Mascot from "./components/Mascot";
import type { MascotAnim, Pose } from "./components/Mascot";
import {
  CarrotMark,
  IconBolt,
  IconBulb,
  IconCheck,
  IconClock,
  IconFlame,
  IconFlag,
  IconNote,
  IconPause,
  IconPlay,
  IconPlus,
  IconReset,
  IconSprout,
  IconStar,
  IconTarget,
  IconTimer,
  IconTrash,
} from "./components/Icons";

/* ────────────────────────── types ────────────────────────── */

type Priority = "high" | "med" | "low";
type View = "today" | "tasks" | "ideas" | "focus";

interface Task {
  id: string;
  title: string;
  tag: string;
  priority: Priority;
  done: boolean;
  createdAt: number;
  completedAt?: number;
}
interface Idea {
  id: string;
  text: string;
  starred: boolean;
  promoted: boolean;
  createdAt: number;
}
interface Session {
  id: string;
  minutes: number;
  endedAt: number;
}
interface Store {
  tasks: Task[];
  ideas: Idea[];
  sessions: Session[];
}
interface Toast {
  id: number;
  msg: string;
  kind: "carrot" | "leaf" | "spark";
}

const KEY = "enertask:v1";
const H = 3600_000;
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const dayKey = (ts: number) => new Date(ts).toDateString();
const isToday = (ts: number) => dayKey(ts) === dayKey(Date.now());

const PRI: Record<Priority, { label: string; chip: string; flag: string }> = {
  high: { label: "High", chip: "bg-carrot text-ink", flag: "text-carrot-deep" },
  med: { label: "Med", chip: "bg-spark text-ink", flag: "text-[#b98a1d]" },
  low: { label: "Low", chip: "bg-mist text-ink/70", flag: "text-ink/40" },
};
const PRI_ORDER: Record<Priority, number> = { high: 0, med: 1, low: 2 };
const CONFETTI_COLORS = ["#FF8235", "#D96820", "#00A36C", "#00C888", "#FFC24B", "#1C1C1E"];

/* ────────────────────────── seed ─────────────────────────── */

function seedStore(): Store {
  const now = Date.now();
  return {
    tasks: [
      { id: uid(), title: "Sketch the onboarding flow for EnerTask", tag: "design", priority: "high", done: false, createdAt: now - 5 * H },
      { id: uid(), title: "Wire up the focus timer ring", tag: "build", priority: "high", done: true, createdAt: now - 8 * H, completedAt: now - 2 * H },
      { id: uid(), title: "Review the idea inbox — promote or compost", tag: "ritual", priority: "med", done: false, createdAt: now - 4 * H },
      { id: uid(), title: "Reply to three beta growers", tag: "outreach", priority: "med", done: false, createdAt: now - 3 * H },
      { id: uid(), title: "Refill the snack drawer (carrots, obviously)", tag: "life", priority: "low", done: true, createdAt: now - 30 * H, completedAt: now - 26 * H },
    ],
    ideas: [
      { id: uid(), text: "Mascot does a victory lap when you clear the whole board", starred: true, promoted: false, createdAt: now - 6 * H },
      { id: uid(), text: "Energy meter drains a little every time a task gets snoozed", starred: false, promoted: false, createdAt: now - 20 * H },
      { id: uid(), text: "Weekly “harvest report” — what shipped, what got composted", starred: false, promoted: false, createdAt: now - 44 * H },
    ],
    sessions: [{ id: uid(), minutes: 25, endedAt: now - 1.2 * H }],
  };
}

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Store;
      if (parsed && Array.isArray(parsed.tasks)) return parsed;
    }
  } catch {
    /* corrupted → reseed */
  }
  return seedStore();
}

/* ────────────────────────── helpers ──────────────────────── */

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [660, 990].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.45);
    });
  } catch {
    /* audio unavailable — no problem */
  }
}

function burst(big = false) {
  confetti({
    particleCount: big ? 160 : 45,
    spread: big ? 100 : 65,
    startVelocity: big ? 45 : 30,
    origin: { y: big ? 0.5 : 0.7 },
    colors: CONFETTI_COLORS,
  });
}

/* ────────────────────────── app ──────────────────────────── */

export default function App() {
  const [store, setStore] = useState<Store>(loadStore);
  const [view, setView] = useState<View>("today");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cheer, setCheer] = useState(false);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
    } catch {
      /* storage full — keep running in memory */
    }
  }, [store]);

  const toast = useCallback((msg: string, kind: Toast["kind"] = "carrot") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const doCheer = useCallback((ms = 2400) => {
    setCheer(true);
    window.setTimeout(() => setCheer(false), ms);
  }, []);

  /* ── actions ── */
  const addTask = (title: string, priority: Priority = "med", tag = "") => {
    setStore((s) => ({ ...s, tasks: [{ id: uid(), title, tag, priority, done: false, createdAt: Date.now() }, ...s.tasks] }));
    toast("Task planted in the field", "leaf");
  };
  const toggleTask = (id: string) => {
    let justDone = false;
    setStore((s) => {
      const tasks = s.tasks.map((t) => {
        if (t.id !== id) return t;
        justDone = !t.done;
        return { ...t, done: !t.done, completedAt: !t.done ? Date.now() : undefined };
      });
      return { ...s, tasks };
    });
    if (justDone) {
      burst();
      const remaining = store.tasks.filter((t) => !t.done && t.id !== id).length;
      if (remaining === 0) {
        doCheer();
        burst(true);
        toast("Board cleared! The field is yours", "spark");
      } else {
        toast("+1 harvested. Keep crunching", "carrot");
      }
    }
  };
  const deleteTask = (id: string) => setStore((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  const clearDone = () => {
    setStore((s) => ({ ...s, tasks: s.tasks.filter((t) => !t.done) }));
    toast("Composted the done pile", "leaf");
  };
  const addIdea = (text: string) => {
    setStore((s) => ({ ...s, ideas: [{ id: uid(), text, starred: false, promoted: false, createdAt: Date.now() }, ...s.ideas] }));
    toast("Idea captured before it escaped", "spark");
  };
  const toggleStar = (id: string) => setStore((s) => ({ ...s, ideas: s.ideas.map((i) => (i.id === id ? { ...i, starred: !i.starred } : i)) }));
  const deleteIdea = (id: string) => setStore((s) => ({ ...s, ideas: s.ideas.filter((i) => i.id !== id) }));
  const promoteIdea = (id: string) => {
    const idea = store.ideas.find((i) => i.id === id);
    if (!idea || idea.promoted) return;
    setStore((s) => ({
      ...s,
      ideas: s.ideas.map((i) => (i.id === id ? { ...i, promoted: true } : i)),
      tasks: [{ id: uid(), title: idea.text, tag: "idea", priority: "med" as Priority, done: false, createdAt: Date.now() }, ...s.tasks],
    }));
    doCheer();
    toast("Idea potted as a task — grow it", "leaf");
  };
  const addSession = (minutes: number) => setStore((s) => ({ ...s, sessions: [{ id: uid(), minutes, endedAt: Date.now() }, ...s.sessions] }));

  /* ── derived ── */
  const stats = useMemo(() => {
    const doneToday = store.tasks.filter((t) => t.completedAt && isToday(t.completedAt)).length;
    const open = store.tasks.filter((t) => !t.done).length;
    const ideasToday = store.ideas.filter((i) => isToday(i.createdAt)).length;
    const focusToday = store.sessions.filter((x) => isToday(x.endedAt)).reduce((a, b) => a + b.minutes, 0);
    const sessionsToday = store.sessions.filter((x) => isToday(x.endedAt)).length;
    const days = new Set(store.tasks.filter((t) => t.completedAt).map((t) => dayKey(t.completedAt as number)));
    let streak = 0;
    const d = new Date();
    if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1);
    while (days.has(dayKey(d.getTime()))) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    const total = store.tasks.length;
    const done = store.tasks.filter((t) => t.done).length;
    let energy = Math.min(100, doneToday * 22 + focusToday + ideasToday * 6 + sessionsToday * 5);
    if (total > 0 && open === 0 && doneToday > 0) energy = 100;
    if (energy === 0 && (doneToday + focusToday + ideasToday) === 0) energy = 8;
    return { doneToday, open, ideasToday, focusToday, sessionsToday, streak, total, done, energy };
  }, [store]);

  const mascotAnim: MascotAnim = cheer ? "cheer" : "idle";

  return (
    <div className="min-h-screen dotgrid text-ink font-body relative overflow-x-clip">
      {/* ambient carrot doodles */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <CarrotMark size={230} className="drift-a absolute -top-8 -right-10 opacity-[0.07] rotate-12" />
        <CarrotMark size={170} className="drift-b absolute top-[45%] -left-12 opacity-[0.06] -rotate-12" />
        <CarrotMark size={120} className="drift-a absolute bottom-24 right-[12%] opacity-[0.05] rotate-45" />
      </div>

      <Header view={view} setView={setView} streak={stats.streak} />

      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-28 md:pb-16">
        {view === "today" && (
          <TodayView
            key="today"
            store={store}
            stats={stats}
            anim={mascotAnim}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onAddTask={addTask}
            onAddIdea={addIdea}
            onPromote={promoteIdea}
            goTasks={() => setView("tasks")}
            goFocus={() => setView("focus")}
          />
        )}
        {view === "tasks" && (
          <TasksView key="tasks" store={store} stats={stats} onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} onClearDone={clearDone} />
        )}
        {view === "ideas" && (
          <IdeasView key="ideas" store={store} onAdd={addIdea} onStar={toggleStar} onDelete={deleteIdea} onPromote={promoteIdea} />
        )}
        {view === "focus" && (
          <FocusView key="focus" store={store} stats={stats} onComplete={(m) => { addSession(m); doCheer(3000); }} toast={toast} />
        )}

        <footer className="mt-16 flex items-center justify-between gap-4 border-t-2 border-ink/10 pt-6 text-xs font-mono text-ink/50">
          <span className="flex items-center gap-2">
            <CarrotMark size={18} /> ENERTASK — grown with carrot-grade energy
          </span>
          <span className="hidden sm:block">data lives in your browser · zero APIs · zero pennies</span>
        </footer>
      </main>

      {/* mobile nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex justify-around border-t-4 border-carrot bg-ink py-2 md:hidden">
        <NavBtn v="today" view={view} setView={setView} label="Today" icon={<IconTarget size={20} />} mobile />
        <NavBtn v="tasks" view={view} setView={setView} label="Tasks" icon={<IconCheck size={20} />} mobile />
        <NavBtn v="ideas" view={view} setView={setView} label="Ideas" icon={<IconBulb size={20} />} mobile />
        <NavBtn v="focus" view={view} setView={setView} label="Focus" icon={<IconTimer size={20} />} mobile />
      </nav>

      {/* toasts */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{ boxShadow: `4px 4px 0 ${t.kind === "carrot" ? "#ff8235" : t.kind === "leaf" ? "#00a36c" : "#ffc24b"}` }}
            className="toast-in flex items-center gap-2.5 border-2 border-ink bg-ink text-paper pl-3 pr-4 py-2.5 rounded-[10px] font-semibold text-sm"
          >
            <span className={t.kind === "carrot" ? "text-carrot" : t.kind === "leaf" ? "text-mint" : "text-spark"}>
              {t.kind === "carrot" ? <CarrotMark size={18} /> : t.kind === "leaf" ? <IconSprout size={18} /> : <IconBolt size={18} />}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────── header ───────────────────────── */

function NavBtn({ v, view, setView, label, icon, mobile = false }: { v: View; view: View; setView: (v: View) => void; label: string; icon: React.ReactNode; mobile?: boolean }) {
  const active = view === v;
  return (
    <button
      onClick={() => setView(v)}
      className={`flex items-center gap-2 rounded-[10px] font-bold uppercase tracking-wide transition-all duration-150 cursor-pointer ${
        mobile ? "flex-col gap-0.5 px-3 py-1 text-[10px]" : "px-3.5 py-2 text-xs border-2"
      } ${
        active
          ? "bg-carrot text-ink border-ink shadow-[3px_3px_0_#00000055]"
          : mobile
            ? "text-paper/60"
            : "border-paper/25 text-paper/75 hover:border-carrot hover:text-carrot"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Header({ view, setView, streak }: { view: View; setView: (v: View) => void; streak: number }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return (
    <header className="sticky top-0 z-40 border-b-4 border-carrot bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 sm:px-6 py-3">
        <button onClick={() => setView("today")} className="flex items-center gap-2.5 cursor-pointer group" aria-label="EnerTask home">
          <span className="grid place-items-center w-10 h-10 bg-paper rounded-[10px] border-2 border-carrot transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
            <CarrotMark size={26} />
          </span>
          <span className="font-display text-2xl leading-none tracking-wide">
            ENER<span className="text-carrot">TASK</span>
          </span>
        </button>

        <nav className="ml-auto hidden md:flex items-center gap-2">
          <NavBtn v="today" view={view} setView={setView} label="Today" icon={<IconTarget size={16} />} />
          <NavBtn v="tasks" view={view} setView={setView} label="Tasks" icon={<IconCheck size={16} />} />
          <NavBtn v="ideas" view={view} setView={setView} label="Ideas" icon={<IconBulb size={16} />} />
          <NavBtn v="focus" view={view} setView={setView} label="Focus" icon={<IconTimer size={16} />} />
        </nav>

        <div className="ml-auto md:ml-0 flex items-center gap-2">
          <span className="chip border-paper/30 text-paper/90 bg-transparent" title="Daily harvest streak">
            <span className="text-carrot"><IconFlame size={13} /></span> {streak}d
          </span>
          <span className="hidden sm:block font-mono text-[11px] uppercase tracking-widest text-paper/60">{today}</span>
        </div>
      </div>
    </header>
  );
}

/* ────────────────────────── shared bits ──────────────────── */

function SpeechBubble({ lines, anim }: { lines: string[]; anim: MascotAnim }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (lines.length < 2) return;
    const iv = window.setInterval(() => setI((x) => (x + 1) % lines.length), 7000);
    return () => window.clearInterval(iv);
  }, [lines.length]);
  const line = lines[Math.min(i, lines.length - 1)];
  return (
    <div key={line + anim} className="bubble-in relative border-2 border-ink bg-white rounded-[12px] px-4 py-2.5 text-sm font-semibold shadow-[3px_3px_0_#1c1c1e]">
      {line}
      <span className="absolute -bottom-[9px] left-8 w-4 h-4 bg-white border-b-2 border-r-2 border-ink rotate-45" />
    </div>
  );
}

function EnergyMeter({ value }: { value: number }) {
  const word = value >= 80 ? "RADIANT" : value >= 50 ? "CHARGED" : value >= 25 ? "WARMING UP" : "SPROUTING";
  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <span className="label-mono">Energy charge</span>
        <span className="font-display text-xl leading-none">
          {word} <span className="text-carrot-deep">{value}%</span>
        </span>
      </div>
      <div className="h-6 border-2 border-ink rounded-full bg-white overflow-hidden relative">
        <div
          className={`h-full transition-all duration-700 ease-out ${value >= 80 ? "stripe-live" : "bg-carrot"}`}
          style={{ width: `${Math.max(4, value)}%` }}
        />
        <CarrotMark size={16} className="absolute top-1/2 -translate-y-1/2 transition-all duration-700" style={{ left: `calc(${Math.max(4, value)}% - 8px)` } as React.CSSProperties} />
      </div>
      <p className="mt-2 text-xs font-medium text-ink/55">Harvest tasks, log focus minutes and capture ideas to charge the carrot.</p>
    </div>
  );
}

function StatCard({ icon, label, value, tone, delay }: { icon: React.ReactNode; label: string; value: string; tone: string; delay: string }) {
  return (
    <div className={`card card-hover rise-in ${delay} flex items-center gap-3 p-4`}>
      <span className={`grid place-items-center w-11 h-11 shrink-0 border-2 border-ink rounded-[10px] ${tone}`}>{icon}</span>
      <div className="min-w-0">
        <div className="font-display text-[26px] leading-none">{value}</div>
        <div className="label-mono mt-1">{label}</div>
      </div>
    </div>
  );
}

function TaskRow({ t, onToggle, onDelete }: { t: Task; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <li className={`group flex items-center gap-3 px-3.5 py-3 border-2 border-ink rounded-[10px] bg-white transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[4px_4px_0_#1c1c1e] ${t.done ? "opacity-70 row-done-flash" : ""}`}>
      <button
        onClick={() => onToggle(t.id)}
        aria-label={t.done ? "Mark as not done" : "Mark as done"}
        className={`grid place-items-center w-7 h-7 shrink-0 border-2 border-ink rounded-[8px] transition-all duration-150 cursor-pointer active:scale-90 ${
          t.done ? "bg-leaf text-paper" : "bg-white hover:bg-mist"
        }`}
      >
        {t.done && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
            <path className="check-draw" d="M4 12.5 9.5 18 20 6.5" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`font-semibold leading-snug transition-all duration-200 ${t.done ? "line-through decoration-2 decoration-carrot text-ink/50" : ""}`}>{t.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className={`chip ${PRI[t.priority].chip}`}>
            <IconFlag size={11} /> {PRI[t.priority].label}
          </span>
          {t.tag && <span className="chip bg-paper text-ink/70">{t.tag}</span>}
          {t.completedAt && <span className="font-mono text-[10px] text-ink/45 uppercase">{new Date(t.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
        </div>
      </div>
      <button
        onClick={() => onDelete(t.id)}
        aria-label="Delete task"
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150 text-ink/40 hover:text-carrot-deep hover:-rotate-6 cursor-pointer p-1"
      >
        <IconTrash size={18} />
      </button>
    </li>
  );
}

/* ────────────────────────── TODAY ────────────────────────── */

function QuickCapture({ onTask, onIdea }: { onTask: (t: string) => void; onIdea: (t: string) => void }) {
  const [mode, setMode] = useState<"task" | "idea">("task");
  const [text, setText] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key.toLowerCase() === "c" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    (mode === "task" ? onTask : onIdea)(v);
    setText("");
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="label-mono">Quick capture</span>
        <div className="flex border-2 border-ink rounded-[8px] overflow-hidden">
          {(["task", "idea"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors cursor-pointer ${mode === m ? (m === "task" ? "bg-carrot" : "bg-spark") : "bg-white hover:bg-mist"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2.5">
        <input
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={mode === "task" ? "Plant a task… (press C anywhere)" : "Catch the spark before it flies…"}
          className="input-ink"
        />
        <button onClick={submit} className="btn-primary px-4 grid place-items-center" aria-label="Capture">
          <IconPlus size={20} />
        </button>
      </div>
    </div>
  );
}

function TodayView({ store, stats, anim, onToggle, onDelete, onAddTask, onAddIdea, onPromote, goTasks, goFocus }: {
  store: Store;
  stats: { doneToday: number; open: number; focusToday: number; streak: number; energy: number; ideasToday: number };
  anim: MascotAnim;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: (t: string) => void;
  onAddIdea: (t: string) => void;
  onPromote: (id: string) => void;
  goTasks: () => void;
  goFocus: () => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "MORNING GRIND" : hour < 17 ? "AFTERNOON PUSH" : "NIGHT SHIFT";
  const allDone = stats.open === 0 && store.tasks.length > 0;

  const now = useMemo(
    () =>
      store.tasks
        .filter((t) => !t.done)
        .sort((a, b) => PRI_ORDER[a.priority] - PRI_ORDER[b.priority] || b.createdAt - a.createdAt)
        .slice(0, 5),
    [store.tasks],
  );
  const recentIdeas = useMemo(() => store.ideas.filter((i) => !i.promoted).slice(0, 3), [store.ideas]);

  const lines = allDone
    ? ["Field's clear. Plant something wild.", "Every carrot harvested. Take the lap."]
    : now.length > 0
      ? ["One task at a time — that's the whole trick.", "Start with the orange one. It's spicy.", "Future-you says thanks in advance."]
      : ["No tasks in the soil. Plant one below!"];

  return (
    <div className="rise-in">
      {/* title block */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="label-mono mb-1.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] tracking-wide">
            {greeting.split(" ").map((w, i) => (
              <span key={w} className={i === 1 ? "text-carrot-deep" : ""}>{w} </span>
            ))}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goFocus} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
            <IconTimer size={17} /> Start focus
          </button>
          <button onClick={goTasks} className="btn-ghost px-4 py-2.5 text-sm flex items-center gap-2">
            <IconNote size={17} /> All tasks
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* left column */}
        <div className="flex flex-col gap-5 min-w-0">
          <div className="card p-5 rise-in rise-in-1">
            <EnergyMeter value={stats.energy} />
          </div>

          <QuickCapture onTask={onAddTask} onIdea={onAddIdea} />

          <section className="card p-5 rise-in rise-in-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl tracking-wide">UP NEXT</h2>
              <span className="chip bg-mist text-ink/70">{stats.open} open</span>
            </div>
            {now.length === 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-5 py-4">
                <Mascot pose="back" anim="idle" className="w-28 shrink-0" label="Mascot walking away" />
                <div>
                  <p className="font-bold text-lg">Nothing left on the field.</p>
                  <p className="text-sm text-ink/60 mt-1">Either you crushed it or you never planted. Either way — add a task and let's go.</p>
                </div>
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {now.map((t) => (
                  <TaskRow key={t.id} t={t} onToggle={onToggle} onDelete={onDelete} />
                ))}
              </ul>
            )}
          </section>

          {recentIdeas.length > 0 && (
            <section className="card p-5 rise-in rise-in-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-2xl tracking-wide">SPARKS</h2>
                <span className="chip bg-spark text-ink"><IconBulb size={12} /> {store.ideas.filter((i) => !i.promoted).length} loose</span>
              </div>
              <ul className="flex flex-col gap-2">
                {recentIdeas.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 border-2 border-dashed border-ink/30 rounded-[10px] px-3.5 py-2.5 bg-paper/60">
                    <span className="text-spark shrink-0"><IconBolt size={16} /></span>
                    <p className="flex-1 text-sm font-medium truncate">{i.text}</p>
                    <button onClick={() => onPromote(i.id)} className="chip bg-leaf text-paper hover:bg-leaf-bright transition-colors cursor-pointer shrink-0">
                      <IconSprout size={12} /> grow it
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* right column — mascot + stats */}
        <div className="flex flex-col gap-5">
          <div className="card p-5 flex flex-col items-center rise-in rise-in-2 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-2 stripe-live" style={{ animationPlayState: allDone ? "paused" : "running" }} />
            <div className="w-full mb-4"><SpeechBubble lines={lines} anim={anim} /></div>
            <Mascot pose="front" anim={anim} className="w-44 -mb-2" />
            <div className="w-full border-t-2 border-ink/10 pt-3 mt-2 flex items-center justify-center gap-2">
              <span className="chip bg-ink text-paper">
                {allDone ? "BOARD CLEARED" : `${stats.open} TO GO`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard delay="rise-in-1" icon={<IconCheck size={20} />} label="Done today" value={`${stats.doneToday}`} tone="bg-leaf-bright text-ink" />
            <StatCard delay="rise-in-2" icon={<IconTimer size={20} />} label="Focus min" value={`${stats.focusToday}`} tone="bg-carrot text-ink" />
            <StatCard delay="rise-in-3" icon={<IconBulb size={20} />} label="Ideas today" value={`${stats.ideasToday}`} tone="bg-spark text-ink" />
            <StatCard delay="rise-in-4" icon={<IconFlame size={20} />} label="Day streak" value={`${stats.streak}`} tone="bg-ink text-carrot" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── TASKS ────────────────────────── */

type Filter = "all" | "active" | "done";

function TasksView({ store, stats, onAdd, onToggle, onDelete, onClearDone }: {
  store: Store;
  stats: { total: number; done: number };
  onAdd: (t: string, p: Priority, tag: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClearDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("med");
  const [tag, setTag] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const tags = useMemo(() => Array.from(new Set(store.tasks.map((t) => t.tag).filter(Boolean))), [store.tasks]);
  const list = useMemo(
    () =>
      store.tasks
        .filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done))
        .filter((t) => (tagFilter ? t.tag === tagFilter : true))
        .sort((a, b) => Number(a.done) - Number(b.done) || PRI_ORDER[a.priority] - PRI_ORDER[b.priority] || b.createdAt - a.createdAt),
    [store.tasks, filter, tagFilter],
  );
  const pct = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

  const submit = () => {
    const v = title.trim();
    if (!v) return;
    onAdd(v, priority, tag.trim().toLowerCase());
    setTitle("");
    setTag("");
  };

  return (
    <div className="rise-in max-w-3xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <p className="label-mono mb-1.5">The field ledger</p>
          <h1 className="font-display text-5xl sm:text-6xl tracking-wide leading-none">TASKS</h1>
        </div>
        <div className="min-w-[180px] flex-1 max-w-xs">
          <div className="flex justify-between mb-1">
            <span className="label-mono">Cleared</span>
            <span className="font-display text-lg leading-none">{pct}%</span>
          </div>
          <div className="h-4 border-2 border-ink rounded-full bg-white overflow-hidden">
            <div className="h-full bg-leaf-bright transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* add form */}
      <div className="card p-4 mb-5 rise-in rise-in-1">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="What needs crunching?"
            className="input-ink flex-1"
          />
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="#tag"
            className="input-ink sm:w-28"
          />
          <button onClick={submit} className="btn-primary px-5 py-2.5 text-sm flex items-center justify-center gap-2">
            <IconPlus size={17} /> Plant it
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="label-mono">Priority</span>
          <div className="flex gap-1.5">
            {(Object.keys(PRI) as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`chip transition-all duration-150 cursor-pointer ${priority === p ? `${PRI[p].chip} shadow-[2px_2px_0_#1c1c1e] -translate-y-[1px]` : "bg-white text-ink/50 hover:text-ink"}`}
              >
                <IconFlag size={11} /> {PRI[p].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4 rise-in rise-in-2">
        {(["all", "active", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`chip cursor-pointer transition-all duration-150 ${filter === f ? "bg-ink text-paper shadow-[2px_2px_0_#ff8235]" : "bg-white text-ink/60 hover:text-ink"}`}
          >
            {f} · {f === "all" ? stats.total : f === "done" ? stats.done : stats.total - stats.done}
          </button>
        ))}
        {tags.length > 0 && <span className="w-px h-5 bg-ink/20 mx-1" />}
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setTagFilter(tagFilter === t ? null : t)}
            className={`chip cursor-pointer transition-all duration-150 ${tagFilter === t ? "bg-carrot shadow-[2px_2px_0_#1c1c1e]" : "bg-white text-ink/60 hover:text-ink"}`}
          >
            #{t}
          </button>
        ))}
        {stats.done > 0 && (
          <button onClick={onClearDone} className="ml-auto chip bg-white text-carrot-deep hover:bg-carrot hover:text-ink transition-colors cursor-pointer">
            <IconTrash size={12} /> compost done
          </button>
        )}
      </div>

      {/* list */}
      {list.length === 0 ? (
        <div className="card p-8 flex flex-col items-center text-center rise-in rise-in-3">
          <Mascot pose="back" anim="idle" className="w-32 mb-3" label="Mascot walking off" />
          <p className="font-display text-2xl tracking-wide">EMPTY ROWS</p>
          <p className="text-sm text-ink/60 mt-2 max-w-xs">
            {filter === "done" ? "Nothing harvested yet. Go crunch something." : tagFilter ? `Nothing tagged #${tagFilter} here.` : "The soil is bare. Plant your first task above."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {list.map((t, i) => (
            <div key={t.id} className={`rise-in rise-in-${Math.min(i + 1, 4)}`}>
              <TaskRow t={t} onToggle={onToggle} onDelete={onDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────── IDEAS ────────────────────────── */

function IdeasView({ store, onAdd, onStar, onDelete, onPromote }: {
  store: Store;
  onAdd: (t: string) => void;
  onStar: (id: string) => void;
  onDelete: (id: string) => void;
  onPromote: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"all" | "starred">("all");
  const ref = useRef<HTMLTextAreaElement>(null);

  const list = useMemo(() => store.ideas.filter((i) => (filter === "all" ? true : i.starred)), [store.ideas, filter]);

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    onAdd(v);
    setText("");
    ref.current?.focus();
  };

  return (
    <div className="rise-in">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <p className="label-mono mb-1.5">Catch sparks before they fly</p>
          <h1 className="font-display text-5xl sm:text-6xl tracking-wide leading-none">IDEA <span className="text-carrot-deep">GARDEN</span></h1>
        </div>
        <div className="flex gap-2">
          {(["all", "starred"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`chip cursor-pointer transition-all duration-150 ${filter === f ? "bg-spark shadow-[2px_2px_0_#1c1c1e]" : "bg-white text-ink/60 hover:text-ink"}`}>
              {f === "starred" ? <IconStar size={11} filled /> : <IconBulb size={11} />} {f} · {f === "all" ? store.ideas.length : store.ideas.filter((i) => i.starred).length}
            </button>
          ))}
        </div>
      </div>

      {/* brain dump */}
      <div className="card p-4 mb-6 rise-in rise-in-1">
        <div className="flex items-center justify-between mb-2">
          <span className="label-mono">Brain dump</span>
          <span className="font-mono text-[10px] text-ink/40 uppercase">ctrl/⌘ + enter</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
            rows={2}
            placeholder="Half-baked is fine. Dump it here, refine it later…"
            className="input-ink flex-1 resize-none"
          />
          <button onClick={submit} className="btn-primary px-5 py-2.5 text-sm flex items-center justify-center gap-2 self-start sm:self-auto">
            <IconBolt size={17} /> Capture
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card p-10 flex flex-col items-center text-center rise-in rise-in-2">
          <Mascot pose="left" anim="idle" className="w-32 mb-3" label="Mascot looking left" />
          <p className="font-display text-2xl tracking-wide">QUIET FIELD</p>
          <p className="text-sm text-ink/60 mt-2 max-w-xs">
            {filter === "starred" ? "No starred sparks yet. Star the ones worth growing." : "No ideas captured. Say the dumb one out loud — then write it down."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((i, idx) => (
            <article
              key={i.id}
              className={`card card-hover p-4 flex flex-col gap-3 rise-in rise-in-${Math.min(idx + 1, 4)} ${i.promoted ? "opacity-75" : ""} ${i.starred ? "border-carrot-deep shadow-[5px_5px_0_#ff8235]" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`mt-0.5 shrink-0 ${i.starred ? "text-spark" : "text-ink/35"}`}><IconBolt size={18} /></span>
                <span className="font-mono text-[10px] uppercase text-ink/40">{new Date(i.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
              </div>
              <p className="font-semibold leading-snug flex-1">{i.text}</p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onStar(i.id)} aria-label="Star idea" className={`p-1.5 border-2 border-ink rounded-[8px] transition-all duration-150 cursor-pointer active:scale-90 ${i.starred ? "bg-spark" : "bg-white hover:bg-mist"}`}>
                  <IconStar size={14} filled={i.starred} />
                </button>
                {i.promoted ? (
                  <span className="chip bg-leaf text-paper flex-1 justify-center"><IconSprout size={12} /> growing as task</span>
                ) : (
                  <button onClick={() => onPromote(i.id)} className="chip bg-ink text-paper hover:bg-leaf transition-colors cursor-pointer flex-1 justify-center">
                    <IconSprout size={12} /> grow into task
                  </button>
                )}
                <button onClick={() => onDelete(i.id)} aria-label="Delete idea" className="p-1.5 border-2 border-ink rounded-[8px] bg-white text-ink/50 hover:text-carrot-deep hover:-rotate-6 transition-all duration-150 cursor-pointer active:scale-90">
                  <IconTrash size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────── FOCUS ────────────────────────── */

function GrowingCarrot({ progress, active, complete, mode }: {
  progress: number;
  active: boolean;
  complete: boolean;
  mode: ModeId;
}) {
  const isRest = mode !== "focus";
  const elapsed = complete ? 1 : Math.min(1, Math.max(0, progress));
  // Keep the plant tiny while the timer still reads roughly 20–25 minutes.
  const growthWindow = Math.min(1, Math.max(0, (elapsed - 0.16) / 0.84));
  const easedGrowth = growthWindow === 0 ? 0 : 1 - Math.pow(2, -10 * growthWindow);
  const plantScale = complete ? 1 : 0.12 + easedGrowth * 0.88;
  const glowOpacity = active ? Math.min(0.6, 0.08 + easedGrowth * 0.52) : 0;
  const leafSway = active && easedGrowth > 0.5 ? Math.sin(easedGrowth * Math.PI * 10) * 4 : 0;

  return (
    <div className={`growing-carrot ${active ? "growing-carrot--active" : ""} ${complete ? "growing-carrot--complete" : ""}`} aria-label={`${isRest ? "Break" : "Focus"} garden progress: ${Math.round(elapsed * 100)}%`} role="img">
      <svg viewBox="0 0 300 300" className="w-[128px] sm:w-[150px]" aria-hidden="true">
        <defs>
          <filter id="carrot-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <ellipse cx="180" cy="240" rx="30" ry="6" fill="#E5E5EA" opacity="0.6" />
        <circle cx="180" cy="230" r="45" fill={isRest ? "#00A36C" : "#00C888"} opacity={glowOpacity} filter="url(#carrot-glow)" className="carrot-glow" />
        <g transform="translate(180 240)">
          <g fill="#1C1C1E" opacity="0.15"><path d="M -35 0 C -20 -15, 20 -15, 35 0 Z" /></g>
          <g className="carrot-plant" style={{ transform: `scale(${plantScale})`, transformOrigin: "0px 0px" }}>
            <g transform="translate(-100 -95)">
              <g className="carrot-leaves" fill="none" strokeLinecap="round" style={{ transform: `rotate(${leafSway}deg)`, transformOrigin: "100px 22px" }}>
                <path d="M 99.5 22 Q 94 14 89 6" stroke="#00A36C" strokeWidth="6" />
                <path d="M 99 21 Q 95 15 91 8" stroke="#00C888" strokeWidth="2" opacity="0.7" />
                <path d="M 100 22 Q 100 13 100 4" stroke="#00A36C" strokeWidth="6" />
                <path d="M 100 21 Q 100 14 100 6" stroke="#00C888" strokeWidth="2" opacity="0.7" />
                <path d="M 100.5 22 Q 106 14 111 6" stroke="#00A36C" strokeWidth="6" />
                <path d="M 101 21 Q 105 15 109 8" stroke="#00C888" strokeWidth="2" opacity="0.7" />
              </g>
              <g>
                <path d="M 88 46 C 78 20, 122 20, 112 46 Q 100 100 88 46 Z" fill={isRest ? "#00A36C" : "#FF8235"} />
                <line x1="94" y1="32" x2="106" y2="32" stroke={isRest ? "#007A50" : "#D96820"} strokeWidth="2" strokeLinecap="round" />
                <line x1="97" y1="40" x2="103" y2="40" stroke={isRest ? "#007A50" : "#D96820"} strokeWidth="2" strokeLinecap="round" />
              </g>
            </g>
          </g>
          <g className="carrot-dirt-front">
            <path d="M -30 2 C -15 -8, 15 -8, 30 2 C 25 8, -25 8, -30 2 Z" fill="#1C1C1E" />
            <path d="M -20 -1 C -10 -12, 10 -12, 20 -1 Z" fill="#1C1C1E" />
            <path d="M -10 -4 C -5 -14, 5 -14, 10 -4 Z" fill="#1C1C1E" />
            <circle cx="-14" cy="-1" r="1.5" fill="#FAF9F6" opacity="0.6" /><circle cx="16" cy="0" r="1" fill="#FAF9F6" opacity="0.8" /><circle cx="0" cy="-6" r="1.5" fill="#FAF9F6" opacity="0.9" />
          </g>
        </g>
      </svg>
      <span className="label-mono growing-carrot__label">{complete ? "harvest ready" : active ? (isRest ? "roots recharging" : "growing with you") : "plant your focus"}</span>
    </div>
  );
}

const MODES = [
  { id: "focus", label: "Focus", secs: 25 * 60 },
  { id: "break", label: "Break", secs: 5 * 60 },
  { id: "long", label: "Long break", secs: 15 * 60 },
] as const;
type ModeId = (typeof MODES)[number]["id"];

function FocusView({ store, stats, onComplete, toast }: {
  store: Store;
  stats: { sessionsToday: number; focusToday: number };
  onComplete: (minutes: number) => void;
  toast: (msg: string, kind?: Toast["kind"]) => void;
}) {
  const [mode, setMode] = useState<ModeId>("focus");
  const [left, setLeft] = useState(MODES[0].secs);
  const [running, setRunning] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const [celebrating, setCelebrating] = useState(false);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const switchMode = (m: ModeId) => {
    setMode(m);
    setLeft(MODES.find((x) => x.id === m)!.secs);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    const iv = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(iv);
  }, [running]);

  /* pacing direction */
  useEffect(() => {
    if (!running) return;
    const iv = window.setInterval(() => setDir((d) => (d === 1 ? -1 : 1)), 3600);
    return () => window.clearInterval(iv);
  }, [running]);

  /* finish */
  useEffect(() => {
    if (left !== 0 || !running) return;
    setRunning(false);
    beep();
    burst(true);
    setCelebrating(true);
    window.setTimeout(() => setCelebrating(false), 2600);
    const m = MODES.find((x) => x.id === modeRef.current)!;
    if (m.id === "focus") {
      onComplete(Math.round(m.secs / 60));
      toast("Focus block banked. Carrots earned.", "carrot");
    } else {
      toast("Break over — stretch those roots", "leaf");
    }
    setLeft(m.secs);
  }, [left, running, onComplete, toast]);

  const total = MODES.find((x) => x.id === mode)!.secs;
  const frac = 1 - left / total;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const R = 120;
  const C = 2 * Math.PI * R;
  const todaySessions = store.sessions.filter((s) => isToday(s.endedAt));
  const pose: Pose = celebrating ? "front" : dir === 1 ? "right" : "left";
  const anim: MascotAnim = celebrating ? "cheer" : running ? "walk" : "idle";
  const lines = celebrating
    ? ["HARVESTED! Look at that pile!"]
    : running
      ? ["Eyes on the carrot.", "Deep work. No snacking.", "Marching with you. Left, right."]
      : ["Pick a mode. I'll march beside you.", "25 minutes. One task. Let's crunch."];

  return (
    <div className="rise-in grid lg:grid-cols-[1fr_320px] gap-6 items-start max-w-5xl mx-auto">
      <div>
        <p className="label-mono mb-1.5">Time is the only real currency</p>
        <h1 className="font-display text-5xl sm:text-6xl tracking-wide leading-none mb-6">FOCUS <span className="text-carrot-deep">RUN</span></h1>

        <div className="card p-5 sm:p-6 flex flex-col items-center rise-in rise-in-1">
          {/* mode pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => switchMode(m.id)}
                className={`chip px-4 py-1.5 text-xs transition-all duration-150 cursor-pointer ${mode === m.id ? "bg-ink text-paper shadow-[2px_2px_0_#ff8235]" : "bg-white text-ink/60 hover:text-ink"}`}
              >
                {m.label} · {m.secs / 60}m
              </button>
            ))}
          </div>

          {/* ring */}
          <div className={`relative w-full max-w-[290px] ${running ? "ring-running" : ""}`}>
            <svg viewBox="0 0 290 290" className="-rotate-90 h-auto w-full">
              <circle cx="145" cy="145" r={R} fill="none" stroke="#e5e5ea" strokeWidth="16" />
              <circle cx="145" cy="145" r={R} fill="none" stroke="#1c1c1e" strokeWidth="16" strokeOpacity="0.08" strokeDasharray="3 14" strokeLinecap="round" />
              <circle
                cx="145" cy="145" r={R} fill="none"
                stroke={mode === "focus" ? "#ff8235" : "#00a36c"}
                strokeWidth="16" strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - frac)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono font-bold text-[42px] sm:text-[56px] md:text-[64px] leading-none tabular-nums">{mm}:{ss}</span>
              <span className="label-mono mt-2">{running ? (mode === "focus" ? "crunching…" : "recharging…") : "ready when you are"}</span>
            </div>
          </div>

          {/* controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button onClick={() => setRunning((r) => !r)} className="btn-primary px-7 py-3 text-base flex items-center gap-2.5">
              {running ? <IconPause size={19} /> : <IconPlay size={19} />}
              {running ? "Pause" : left < total ? "Resume" : "Start"}
            </button>
            <button onClick={() => switchMode(mode)} className="btn-ghost px-4 py-3 grid place-items-center" aria-label="Reset timer">
              <IconReset size={18} />
            </button>
            {running && (
              <button onClick={() => setLeft((s) => s + 300)} className="btn-ghost px-4 py-3 text-sm">
                +5:00
              </button>
            )}
          </div>

          {/* session dots */}
          <div className="flex items-center gap-1.5 mt-5">
            <span className="label-mono mr-1">today</span>
            {Array.from({ length: Math.max(4, Math.min(stats.sessionsToday, 10)) }).map((_, i) => (
              <span key={i} className={`w-3 h-3 border-2 border-ink rounded-full ${i < stats.sessionsToday ? "bg-carrot" : "bg-white"}`} />
            ))}
          </div>
        </div>

        {/* pacing track */}
        <div className="card p-4 mt-5 rise-in rise-in-2 overflow-hidden">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex-1"><SpeechBubble lines={lines} anim={anim} /></div>
          </div>
          <div className="relative h-[170px] mt-2">
            <div className="absolute bottom-[14px] inset-x-4 border-t-2 border-dashed border-ink/25" />
            <div
              className="absolute bottom-0 -translate-x-1/2 transition-[left] ease-linear will-change-[left]"
              style={{ left: running ? (dir === 1 ? "78%" : "22%") : "50%", transitionDuration: running ? "3600ms" : "400ms" }}
            >
              <Mascot pose={pose} anim={anim} className="w-[82px] sm:w-[96px]" label="Mascot pacing while focusing" />
            </div>
            <div className="absolute bottom-0 right-[4%] sm:right-[10%]">
              <GrowingCarrot progress={frac} active={running} complete={celebrating} mode={mode} />
            </div>
          </div>
        </div>
      </div>

      {/* side column */}
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <StatCard delay="rise-in-1" icon={<IconTimer size={20} />} label="Min today" value={`${stats.focusToday}`} tone="bg-carrot text-ink" />
          <StatCard delay="rise-in-2" icon={<IconBolt size={20} />} label="Blocks" value={`${stats.sessionsToday}`} tone="bg-leaf-bright text-ink" />
        </div>

        <div className="card p-5 rise-in rise-in-2">
          <h3 className="font-display text-xl tracking-wide mb-3">TODAY'S HARVEST</h3>
          {todaySessions.length === 0 ? (
            <p className="text-sm text-ink/55 flex items-center gap-2">
              <span className="text-ink/35"><IconClock size={16} /></span> No blocks logged yet. The field awaits.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {todaySessions.slice(0, 7).map((s) => (
                <li key={s.id} className="flex items-center justify-between border-2 border-ink/15 rounded-[8px] px-3 py-2 bg-white">
                  <span className="flex items-center gap-2 text-sm font-bold"><span className="text-carrot-deep"><IconTimer size={15} /></span>{s.minutes} min block</span>
                  <span className="font-mono text-[11px] text-ink/45">{new Date(s.endedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5 rise-in rise-in-3 bg-ink text-paper border-ink">
          <h3 className="font-display text-xl tracking-wide mb-3 text-carrot">HOUSE RULES</h3>
          <ul className="flex flex-col gap-2.5 text-sm font-medium text-paper/85">
            <li className="flex gap-2.5"><span className="text-carrot font-display">01</span> One task per block. The carrot doesn't multitask.</li>
            <li className="flex gap-2.5"><span className="text-carrot font-display">02</span> Phone in another room. Yes, really.</li>
            <li className="flex gap-2.5"><span className="text-carrot font-display">03</span> Break means stand up. The legs know things.</li>
            <li className="flex gap-2.5"><span className="text-carrot font-display">04</span> Finished early? Bank the win, don't inflate the block.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
