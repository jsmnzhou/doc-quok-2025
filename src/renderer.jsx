import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from "react";
import Sprite from './components/Sprite';

const App = () => {
  // MVP state management
  const [spriteState, setSpriteState] = useState("idle");
  const [hidden, setHidden] = useState(false);
  const [report, setReport] = useState({
    scanned: 1234,
    vulnerabilities: 3,
    alerts: 2,
    antivirus: "Active",
    calendar: "No events",
    slack: "1 new message",
    gmail: "2 unread emails",
  });

  // Example: Simulate notification
  React.useEffect(() => {
    const timer = setTimeout(() => setSpriteState("notification"), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <button onClick={() => setHidden(h => !h)}>
        {hidden ? "Show Pet" : "Hide Pet"}
      </button>
      <Sprite state={spriteState} hidden={hidden} />
      <div style={{ color: "#fff", background: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 8, marginTop: 150 }}>
        <h2>Security Dashboard</h2>
        <p>Files scanned: {report.scanned}</p>
        <p>Vulnerabilities: {report.vulnerabilities}</p>
        <p>Recent alerts: {report.alerts}</p>
        <p>Antivirus: {report.antivirus}</p>
        <p>Calendar: {report.calendar}</p>
        <p>Slack: {report.slack}</p>
        <p>Gmail: {report.gmail}</p>
      </div>
    </>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);