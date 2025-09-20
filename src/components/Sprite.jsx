import React, { useState, useEffect } from "react";
import spriteSheet from "../assets/sprites/quokka-idle-1.png"; // Add your sprite sheet image here

const SPRITE_STATES = {
  idle: { x: 0, y: 0 },
  walking: { x: 1, y: 0 },
  notification: { x: 2, y: 0 },
  peeking: { x: 3, y: 0 },
};

const SPRITE_SIZE = 128; // px, adjust to your sprite sheet

export default function Sprite({ state = "idle", draggable = true, hidden = false }) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function onMouseMove(e) {
      if (dragging) {
        setPosition({
          x: e.clientX - offset.x,
          y: e.clientY - offset.y,
        });
      }
    }
    function onMouseUp() {
      setDragging(false);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, offset]);

  if (hidden) return null;

  const { x, y } = SPRITE_STATES[state];

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: SPRITE_SIZE,
        height: SPRITE_SIZE,
        pointerEvents: draggable ? "auto" : "none",
        cursor: draggable ? "grab" : "default",
        userSelect: "none",
        zIndex: 9999,
      }}
      onMouseDown={e => {
        setDragging(true);
        setOffset({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }}
    >
      <div
        style={{
          width: SPRITE_SIZE,
          height: SPRITE_SIZE,
          backgroundImage: `url(${spriteSheet})`,
          backgroundPosition: `-${x * SPRITE_SIZE}px -${y * SPRITE_SIZE}px`,
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}