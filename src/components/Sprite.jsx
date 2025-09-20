import React, { useState, useRef } from "react";
import WaitingSprite from "./sprite-states/WaitingSprite";

export default function Sprite({ draggable = true, hidden = false }) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [menuVisible, setMenuVisible] = useState(false);
  const [dragging, setDragging] = useState(false);

  const mouseStart = useRef({ x: 0, y: 0 });
  const dragThreshold = 5; // pixels

  if (hidden) return null;

  const handleMouseDown = e => {
    if (!draggable) return;
    setDragging(false);
    mouseStart.current = { x: e.clientX, y: e.clientY };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = e => {
    const dx = e.clientX - mouseStart.current.x;
    const dy = e.clientY - mouseStart.current.y;

    if (!dragging && Math.hypot(dx, dy) > dragThreshold) {
      setDragging(true);
      setMenuVisible(false);
    }

    if (dragging) {
      setPosition({
        x: e.clientX - (mouseStart.current.x - position.x),
        y: e.clientY - (mouseStart.current.y - position.y),
      });
    }
  };

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);

    if (!dragging) {
      setMenuVisible(prev => !prev); // toggle menu
    }
  };

  return (
    <>
      <div onMouseDown={handleMouseDown}>
        <WaitingSprite position={position} setPosition={setPosition} />
      </div>

      {menuVisible && (
        <div
          style={{
            position: "absolute",
            left: position.x + 130,
            top: position.y,
            background: "white",
            border: "1px solid black",
            padding: "8px",
            zIndex: 10000,
          }}
        >
          <p>Menu Item 1</p>
          <p>Menu Item 2</p>
        </div>
      )}
    </>
  );
}
