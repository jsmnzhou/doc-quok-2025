import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, FolderSearch, Activity, Bug, Cpu, Loader2 } from "lucide-react";

const tasks = [
  { icon: FolderSearch, label: "Enumerating files" },
  { icon: Activity, label: "Heuristic analysis" },
  { icon: Bug, label: "Signature sweep" },
  { icon: Cpu, label: "Process & memory scan" },
];

export default function Scanner({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  // fake filenames for visual feedback
  const lines = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => `C:/Users/Public/${i.toString(16)}-tmp.dll`),
    []
  );

  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(100, p + Math.max(1, Math.round(Math.random() * 7)));
      setProgress(p);
      setPhase(Math.min(tasks.length - 1, Math.floor((p / 100) * tasks.length)));
      if (p >= 100) {
        clearInterval(id);
        // mock result payload handed to dashboard
        const summary = {
          scanned: 42873,
          durationMs: 37_500,
          threats: { critical: 0, high: 1, medium: 4, low: 12, quarantined: 5 },
          lastRun: new Date().toISOString(),
        };
        setTimeout(() => onComplete?.(summary), 900);
      }
    }, 140);
    return () => clearInterval(id);
  }, [onComplete]);

  return (
    <div className="scan-shell">
      {/* grid background */}
      <div className="scan-grid" />

      {/* radar disc */}
      <motion.div
        className="radar-disc"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
      />

      {/* sweep beam */}
      <motion.div
        className="radar-sweep"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
      />

      {/* progress ring */}
      <ProgressRing value={progress} size={220} stroke={10} />

      <div className="scan-head">
        <span className="scan-title"><ShieldAlert size={18}/> Quokka AV — Smart Scan</span>
        <span className="scan-sub">Phase {phase + 1}/{tasks.length}: {tasks[phase].label}</span>
      </div>

      {/* task chips */}
      <div className="task-list">
        {tasks.map((t, i) => {
          const ActiveIcon = t.icon;
          const active = i <= phase;
          return (
            <div key={t.label} className={`task-chip ${active ? "task-active" : ""}`}>
              <ActiveIcon size={16} />
              <span>{t.label}</span>
              {active && i === phase && <Loader2 className="spin" size={14} />}
            </div>
          );
        })}
      </div>

      {/* scrolling log */}
      <div className="scan-log">
        {lines.map((s, i) => (
          <motion.div
            key={s + i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: i < Math.floor(progress / 4) ? 0.85 : 0.25, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.02 }}
          >
            {s}
          </motion.div>
        ))}
      </div>

      {/* quokka helper */}
      <QuokkaBubble text={`Scanning… ${progress}%`} />
    </div>
  );
}

function ProgressRing({ value, size = 200, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;

  return (
    <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="ring-bg" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        className="ring-fg"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="ring-text">
        {value}%
      </text>
    </svg>
  );
}

function QuokkaBubble({ text }) {
  // place your sprite at: /src/sprites/quokka.png (32x32)
  const sprite = new URL("../../sprites/quokka.png", import.meta.url).href;
  return (
    <motion.div
      className="quokka"
      initial={{ y: 0 }}
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
    >
      <img src={sprite} alt="Quokka" />
      <div className="bubble">{text}</div>
    </motion.div>
  );
}