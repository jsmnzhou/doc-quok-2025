import React, { useState, useEffect } from "react";
import idleSpriteSheet from "../../assets/sprites/quokka-notification-hat.png";

const SPRITE_FRAME = 32;       // original frame size in sprite sheet
const FRAMES = 4;              // number of frames
const SPRITE_DISPLAY = 128;    // scaled display size

export default function NotificationSprite({ position, setPosition, draggable, dragging, notifications = [{message: "hello!"}], setNotifications }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setFrame(prev => (prev + 1) % FRAMES), 300);
    return () => clearInterval(interval);
  }, []);

  // Only show the first notification in the list
  const currentNotification = notifications?.[0];

  return (
    <div
      className="quokka-sprite"
      data-interactive
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: SPRITE_DISPLAY,
        height: SPRITE_DISPLAY,
        userSelect: "none",
        pointerEvents: draggable ? "auto" : "none",
        cursor: dragging ? "grabbing" : "grab",
        zIndex: 9999,
      }}
    >
      {/* Sprite animation */}
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: `url(${idleSpriteSheet})`,
          backgroundPosition: `-${frame * SPRITE_DISPLAY}px 0px`,
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          backgroundSize: `${FRAMES * SPRITE_DISPLAY}px ${SPRITE_DISPLAY}px`,
        }}
      />

      {/* Pixel speech bubble */}
      {currentNotification && (
        <div
          style={{
            position: "absolute",
            left: "100%",           // place to the right of the sprite
            top: 0,
            marginLeft: 8,
            padding: "4px 6px",
            backgroundColor: "#fff",
            color: "#000",
            fontFamily: "monospace",
            fontSize: 12,
            border: "2px solid #000",
            borderRadius: 4,
            whiteSpace: "nowrap",
            zIndex: 10000,
            imageRendering: "pixelated",
          }}
        >
          {currentNotification.message}
        </div>
      )}
    </div>
  );
}
