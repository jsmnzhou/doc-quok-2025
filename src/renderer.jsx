import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from "react";
import Sprite from './components/Sprite';
import './index.css';

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
  const [dashboardOpen, setDashboardOpen] = useState(false);

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
      <Sprite
        state={spriteState}
        hidden={hidden}
        onSpriteClick={() => setDashboardOpen(true)}
        onNotificationClick={() => setDashboardOpen(false)} // Optionally handle notification
      />
      {dashboardOpen && (
        <div
          style={{
            position: "fixed",
            left: 0,
            bottom: 0,
            width: "100vw",
            background: "rgba(30,30,30,0.85)",
            color: "#fff",
            padding: "16px 32px",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.3)",
            zIndex: 9998,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 8px 0" }}>Security Dashboard</h2>
            <p>Files scanned: {report.scanned}</p>
            <p>Vulnerabilities: {report.vulnerabilities}</p>
            <p>Recent alerts: {report.alerts}</p>
            <p>Antivirus: {report.antivirus}</p>
            <p>Calendar: {report.calendar}</p>
            <p>Slack: {report.slack}</p>
            <p>Gmail: {report.gmail}</p>
            <button
              style={{
                marginTop: 16,
                padding: "8px 16px",
                background: "#4fc3f7",
                color: "#222",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "bold",
                pointerEvents: "auto",
              }}
              onClick={() => setDashboardOpen(false)}
            >
              Close Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);