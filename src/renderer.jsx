import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from "react";
import Sprite from './components/Sprite';
import QuokkaHUD from "./components/security/QuokkaHUD.jsx";
import './styles.css'

function useClickThroughWhitelist(selectors = '.btn, .hud-resize, .hud-head, .quokka-sprite, .quokka-menu, .quokka-menu-option, [data-interactive]') {
  useEffect(() => {
    let pressed = false;

    const allow = () => window.quokkaWindow?.setPassThrough(false);
    const block = () => window.quokkaWindow?.setPassThrough(true);

    const onMove = (e) => {
      if (pressed) return; // stay allowed while dragging
      const el = e.target.closest(selectors);
      if (el) allow(); else block();
    };

    const onDown = (e) => {
      const el = e.target.closest(selectors);
      pressed = !!el;
      if (pressed) allow(); else block();
    };

    const onUp = () => { pressed = false; block(); };

    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('blur', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('blur', onUp);
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
  const [hudMode, setHudMode] = useState("message"); // Add state for HUD mode
  const [hudVisible, setHudVisible] = useState(false); // Control HUD visibility

  useClickThroughWhitelist('.btn, .hud-resize, .hud-head, .quokka-sprite, .quokka-menu, .quokka-menu-option, [data-interactive]');

  // Example: Simulate notification
  React.useEffect(() => {
    const timer = setTimeout(() => setSpriteState("notification"), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSpriteClick = () => {
    setHudVisible(true);
    setHudMode("message"); // Set to dashboard mode
  };

  const handleNotificationClick = () => {
    console.log("Notification clicked");
    // You could set a different mode for notifications if needed
  };

  return (
    <>
      <button className="btn" onClick={() => setHidden(h => !h)}>
        {hidden ? "Show Pet" : "Hide Pet"}
      </button>

      {/* Conditionally render HUD */}
      {hudVisible && (
        <QuokkaHUD 
          initialMode={hudMode} 
          onClose={() => setHudVisible(false)}
        />
      )}

      <Sprite
        state={spriteState}
        hidden={hidden}
        className="quokka-sprite"
        onSpriteClick={handleSpriteClick}
        onNotificationClick={handleNotificationClick}
      />
 main
    </>

  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);