import spriteSheet from "../assets/sprites/quokka-idle-1.png"; 
import React, { useState, useRef, useEffect } from "react";
import WaitingSprite from "./sprite-states/WaitingSprite";
import DraggingSprite from "./sprite-states/DraggingSprite";
import { getRandomReminder } from "./data/WorkReminders.js"; // Import the reminders


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
];

const SPRITE_SIZE = 256; // px
const DRAG_THRESHOLD = 5; // px — movement beyond this is considered a drag

export default function Sprite({ state = "idle", draggable = true, hidden = false, onSpriteClick, onNotificationClick }) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [menuVisible, setMenuVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [spriteState, setSpriteState] = useState(state);
  const [showMenu, setShowMenu] = useState(false);
  const [showTextBubble, setShowTextBubble] = useState(false);
  const [currentReminder, setCurrentReminder] = useState("");

  const bubbleTimeoutRef = useRef(null);



  // Track initial mouse down position to distinguish click vs drag
  const initialMousePos = useRef({ x: 0, y: 0 });

  if (hidden) return null;

  // Sync sprite state with notifications
  useEffect(() => {
    if (!notifications.some(n => n.unread > 0 || n.events > 0)) {
      setSpriteState(state);
    }
  }, [state, notifications]);

  // Poll notifications every 30s
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

  // Text bubble system - show random reminders
  useEffect(() => {
    const setupBubbleInterval = () => {
      // Clear any existing timeout
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
      }

      // Set random interval
      const randomInterval = Math.floor(Math.random() * (10000 - 5000)) + 4500;
      
      bubbleTimeoutRef.current = setTimeout(() => {
        if (!hidden && !dragging && !showMenu && !showPopup) {
          setCurrentReminder(getRandomReminder());
          setShowTextBubble(true);
          
          // Hide bubble after 5 seconds
          setTimeout(() => {
            setShowTextBubble(false);
          }, 5000);
        }
        
        // Set up next bubble
        setupBubbleInterval();
      }, randomInterval);
    };

    // Start the bubble system
    setupBubbleInterval();

    // Cleanup on unmount
    return () => {
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
      }
    };
  }, [hidden, dragging, showMenu, showPopup]);

  // Global mouse move & up handlers
  useEffect(() => {
    function onMouseMove(e) {
      if (dragging) {
        setPosition({
          x: e.clientX - offset.x,
          y: e.clientY - offset.y,
        });
      }
    }

    function onMouseUp(e) {
      if (dragging) {
        setDragging(false);

        // Check if movement was small -> treat as click
        const dx = Math.abs(e.clientX - initialMousePos.current.x);
        const dy = Math.abs(e.clientY - initialMousePos.current.y);
        if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
          setShowMenu(true);
        }
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, offset]);

  const handleMouseDown = e => {
    if (e.button !== 0) return; // Only left mouse button
    initialMousePos.current = { x: e.clientX, y: e.clientY };
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    setDragging(true);
  };

  return (
    <>
      <div onMouseDown={handleMouseDown}>
        {dragging ? (
          <DraggingSprite position={position} setPosition={setPosition} draggable={draggable} dragging={dragging} />
        ) : (
          <WaitingSprite position={position} setPosition={setPosition} draggable={draggable} dragging={dragging} />
        )}
      {/* Text Bubble */}
        {showTextBubble && (
          <div
            className="text-bubble"
            data-interactive
            style={{
              position: "absolute",
              left: position.x + SPRITE_SIZE / 2,
              top: position.y - 60,
              transform: 'translateX(-50%)',
              background: "rgba(30,30,30,0.95)",
              color: "#fff",
              padding: "12px 16px",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              zIndex: 10002,
              maxWidth: "200px",
              fontSize: "14px",
              fontWeight: "500",
              pointerEvents: "none",
              animation: "fadeIn 0.3s ease-out"
            }}
          >
            {currentReminder}
            <div
              style={{
                position: "absolute",
                bottom: "-8px",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "8px solid rgba(30,30,30,0.95)"
              }}
            />
          </div>
        )}
      </div>
      
      {/* Submenu popup */}
      {showMenu && (
        <div
          className="quokka-menu"
          data-interactive
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
            className="quokka-menu-option"
            data-interactive
            style={{ margin: "8px 0", width: "100%" }}
            onClick={() => {
              setShowMenu(false);
              if (typeof onSpriteClick === "function") onSpriteClick();
            }}
          >
            Open Dashboard
          </button>
          <button
            className="quokka-menu-option"
            data-interactive
            style={{ margin: "8px 0", width: "100%" }}
            onClick={() => {
              setShowMenu(false);
              setShowPopup(true);
              if (typeof onNotificationClick === "function") onNotificationClick();
            }}
          >
            Check Notifications
          </button>
          <button
            className="quokka-menu-option"
            data-interactive
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
          className="quokka-menu"
          data-interactive
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
          <button className = "btn" onClick={() => setShowPopup(false)} style={{ marginTop: 8 }}>
            Close
          </button>
        </div>
      )}
      {/* Add CSS animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, 10px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        `}
      </style>
    </>
  );
}
