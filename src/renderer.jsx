import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from "react";
import Sprite from './components/Sprite';
import QuokkaHUD from "./components/security/QuokkaHUD.jsx";
import './styles.css'

function useClickThroughWhitelist(selectors = '.btn, .hud-resize, .hud-head, [data-interactive]') {
  useEffect(() => {
    const allow = () => window.quokkaWindow?.setPassThrough(false);
    const block = () => window.quokkaWindow?.setPassThrough(true);

    // Start: pass through everywhere
    block();

    // Event delegation—decide based on current hover/focus
    const onMove = (e) => {
      const el = e.target.closest(selectors);
      if (el) allow(); else block();
    };
    const onLeaveWindow = () => block();

    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerdown', onMove, true); // ensures clicks land
    window.addEventListener('blur', onLeaveWindow);
    // keyboard accessibility: keep clickable when focused via Tab
    window.addEventListener('focusin', allow);
    window.addEventListener('focusout', block);

    return () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerdown', onMove, true);
      window.removeEventListener('blur', onLeaveWindow);
      window.removeEventListener('focusin', allow);
      window.removeEventListener('focusout', block);
    };
  }, [selectors]);
}


const App = () => {
  // useClickThroughWhitelist();
  // MVP state management
  const [spriteState, setSpriteState] = useState("idle");
  const [hidden, setHidden] = useState(false);
  const [view, setView] = useState("scanner");
  const [report, setReport] = useState(null); // will receive results from scanner

  useClickThroughWhitelist('.btn, .hud-resize, .hud-head, [data-interactive]');

  // Example: Simulate notification
  React.useEffect(() => {
    const timer = setTimeout(() => setSpriteState("notification"), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <button className="btn" onClick={() => setHidden(h => !h)}>
        {hidden ? "Show Pet" : "Hide Pet"}
      </button>
      <Sprite state={spriteState} hidden={hidden} />
      <QuokkaHUD />

    </>

  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);