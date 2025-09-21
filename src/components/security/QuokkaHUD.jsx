import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Scanner from "./Scanner.jsx";
import Dashboard from "./Dashboard.jsx";

const modes = { message: "message", scan: "scan", summary: "summary" };

export default function QuokkaHUD({ initialMode = "message", onClose }) {
    //   useClickThroughWhitelist();
  // position + size
  const boundsRef = useRef(null);
  const [pos, setPos] = useState({ x: 24, y: 24 });
  const [size, setSize] = useState({ w: 420, h: 240 }); // small by default
  const [mode, setMode] = useState(initialMode);
  const [summary, setSummary] = useState(null);


  // target sizes per mode
  const targets = {
    [modes.message]: { w: 420, h: 240 },
    [modes.scan]:    { w: 420, h: 480 },
    [modes.summary]: { w: 560, h: 460 },
  };

  // animate container to each mode’s size
  useEffect(() => {
    const t = targets[mode];
    setSize((s) => ({ w: t.w, h: t.h }));
  }, [mode]);

  // resize handle
  const onResizeDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId); // keep events while dragging. :contentReference[oaicite:1]{index=1}
    const start = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
    const move = (ev) => {
      const w = Math.max(320, start.w + (ev.clientX - start.x));
      const h = Math.max(200, start.h + (ev.clientY - start.y));
      setSize({ w, h });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const sprite = new URL("../../sprites/quokka.png", import.meta.url).href;

  return (
    <div ref={boundsRef} className="hud-bounds">
      <motion.div
        className="hud"
        drag
        dragMomentum={false}
        dragConstraints={boundsRef}
        onDragEnd={(_, info) => setPos({ x: info.point.x, y: info.point.y })}
        animate={{ width: size.w, height: size.h, x: pos.x, y: pos.y }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        layout // smooth size/position changes. :contentReference[oaicite:2]{index=2}
      >
        <div className="hud-head">
          <div className="hud-title">
            <img src={sprite} alt="Quokka" />
            <span>Quokka AV</span>
          </div>
          <div className="hud-actions">
            <button className="btn ghost" onClick={onClose}>×</button>
            {mode !== modes.scan && (
              <button className="btn ghost" onClick={() => setMode(modes.scan)}>Scan</button>
            )}
            {mode === modes.summary && (
              <button className="btn ghost" onClick={() => setMode(modes.message)}>Minimize</button>
            )}
          </div>
        </div>

        <div className="hud-body">
          <AnimatePresence mode="wait"> {/* animate in/out between modes. :contentReference[oaicite:3]{index=3} */}
            {mode === modes.message && (
              <motion.div
                key="msg"
                className="hud-msg"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <div className="msg-title">Hey! Want me to check your system?</div>
                <div className="msg-sub">
                  I’ll do heuristics, signatures, and a quick memory sweep. You can resize me and keep working.
                </div>
                <div className="msg-cta">
                  <button className="btn" onClick={() => setMode(modes.scan)}>Start Smart Scan</button>
                </div>
              </motion.div>
            )}

            {mode === modes.scan && (
              <motion.div
                key="scan"
                className="hud-scan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                layout
              >
                <Scanner
                  compact
                  embedded
                  ringSize={Math.max(140, Math.min(240, size.w - 220))}
                  onComplete={(s) => {
                    setSummary(s);
                    setMode(modes.summary);
                  }}
                />
              </motion.div>
            )}

            {mode === modes.summary && (
              <motion.div
                key="sum"
                className="hud-summary"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                layout
              >
                <Dashboard summary={summary} compact onRescan={() => setMode(modes.scan)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hud-resize" onPointerDown={onResizeDown} />
      </motion.div>
    </div>
  );
}