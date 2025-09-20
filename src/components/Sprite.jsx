import React, { useState, useRef, useEffect } from "react";
import WaitingSprite from "./sprite-states/WaitingSprite";
import DraggingSprite from "./sprite-states/DraggingSprite";

// Notification service mock
const notificationServices = [
  {
    name: "Gmail",
    fetch: async () => ({
      unread: 2,
      link: "https://mail.google.com/",
      message: "You have 2 unread emails.",
    }),
  },
  {
    name: "Calendar",
    fetch: async () => ({
      events: 1,
      link: "https://calendar.google.com/",
      message: "You have 1 upcoming event.",
    }),
  },
  // Add more services here
];

const SPRITE_SIZE = 256; // px

export default function Sprite({ state = "idle", draggable = true, hidden = false, onSpriteClick, onNotificationClick }) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [menuVisible, setMenuVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [spriteState, setSpriteState] = useState(state);
  const [wasDragging, setWasDragging] = useState(false);
  const[showMenu, setShowMenu] = useState(false);
   const mouseStart = useRef({ x: 0, y: 0 });
  const dragThreshold = 5; // pixels

  if (hidden) return null;

  // Keep spriteState in sync with prop unless notification is present
  useEffect(() => {
    if (!notifications.some(n => n.unread > 0 || n.events > 0)) {
      setSpriteState(state);
    }
  }, [state, notifications]);

  // Poll notifications every 30s and update sprite state accordingly
  useEffect(() => {
    async function pollNotifications() {
      const results = await Promise.all(notificationServices.map(s => s.fetch()));
      setNotifications(results);
      if (results.some(n => n.unread > 0 || n.events > 0)) {
        setSpriteState("notification");
      } else {
        setSpriteState(state);
      }
    }
    pollNotifications();
    const interval = setInterval(pollNotifications, 30000);
    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    function onMouseMove(e) {
      if (dragging) {
        setPosition({
          x: e.clientX - offset.x,
          y: e.clientY - offset.y,
        });
        setWasDragging(true); // Mark as dragging
      }
    }
    function onMouseUp() {
      setDragging(false);
      // If not dragging, allow click
      setTimeout(() => setWasDragging(false), 0); // Reset after mouse up
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, offset]);

  const handleMouseDown = e => {
          // Only start drag if left mouse button
          if (e.button !== 0) return;
          setDragging(true);
          setOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
          });
          setWasDragging(false); // Reset drag flag
        }

  const handleMouseClick = e => {
          if (!wasDragging) setShowMenu(true);
        }

  return (
    <>
        <div onMouseDown={handleMouseDown} onClick={handleMouseClick}
        >
          {dragging ? (
            <DraggingSprite position={position} setPosition={setPosition} draggable={draggable} dragging={dragging} />
          ) : (
            <WaitingSprite position={position} setPosition={setPosition} draggable={draggable} dragging={dragging} />
          )}
      </div>

      {/* Submenu popup */}
      {showMenu && (
        <div
          style={{
            position: "fixed",
            left: position.x + SPRITE_SIZE,
            top: position.y,
            background: "rgba(30,30,30,0.98)",
            color: "#fff",
            padding: 16,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            zIndex: 10001,
            minWidth: 180,
          }}
        >
          <h4>Quokka Menu</h4>
          <button
            style={{ margin: "8px 0", width: "100%" }}
            onClick={() => {
              setShowMenu(false);
              if (typeof onSpriteClick === "function") onSpriteClick(); // Open dashboard
            }}
          >
            Open Dashboard
          </button>
          <button
            style={{ margin: "8px 0", width: "100%" }}
            onClick={() => {
              setShowMenu(false);
              setShowPopup(true); // Show notifications
              if (typeof onNotificationClick === "function") onNotificationClick(); // Optionally notify parent
            }}
          >
            Check Notifications
          </button>
          <button
            style={{ margin: "8px 0", width: "100%" }}
            onClick={() => setShowMenu(false)}
          >
            Cancel
          </button>
        </div>
      )}
      {/* Notifications popup */}
      {showPopup && notifications.length > 0 && (
        <div
          style={{
            position: "fixed",
            left: position.x + SPRITE_SIZE,
            top: position.y + 80,
            background: "rgba(30,30,30,0.95)",
            color: "#fff",
            padding: 16,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            zIndex: 10000,
            minWidth: 220,
            pointerEvents: "auto",
          }}
        >
          <h4>Notifications</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {notifications.map((n, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <span>{n.message}</span>
                <br />
                <a
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#4fc3f7" }}
                >
                  Open {notificationServices[i].name}
                </a>
              </li>
            ))}
          </ul>
          <button onClick={() => setShowPopup(false)} style={{ marginTop: 8 }}>
            Close
          </button>
        </div>
      )}
    </>
  );
}