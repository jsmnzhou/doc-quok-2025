import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from "react";
import Sprite from './components/Sprite';
import Scanner from './components/security/Scanner'; 
import Dashboard from './components/security/Dashboard';
import './styles.css'

const App = () => {
  // MVP state management
  const [spriteState, setSpriteState] = useState("idle");
  const [hidden, setHidden] = useState(false);
  const [view, setView] = useState("scanner");
  const [report, setReport] = useState(null); // will receive results from scanner


  // Example: Simulate notification
  React.useEffect(() => {
    const timer = setTimeout(() => setSpriteState("notification"), 5000);
    return () => clearTimeout(timer);
  }, []);

  return view === "scanner" ? (
    <Scanner
      onComplete={(summary) => {
        setReport(summary);
        setView("dashboard");
      }}
    />
  ) : (
    <>
      <button onClick={() => setHidden(h => !h)}>
        {hidden ? "Show Pet" : "Hide Pet"}
      </button>
      <Sprite state={spriteState} hidden={hidden} />
      <Dashboard summary={report} onRescan={() => setView("scanner")} />

    </>

  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);