import React, { useState, useEffect } from "react";
import idleSpriteSheet from "../sprites/quokka-idle.png";

const SPRITE_FRAME = 32;       // original frame size in sprite sheet
const FRAMES = 6;              // number of frames
const SPRITE_DISPLAY = 128;    // scaled display size

export default function DraggingSprite({ position, setPosition, draggable, dragging }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setFrame(prev => (prev + 1) % FRAMES), 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
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
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: `url(${idleSpriteSheet})`,
          backgroundPosition: `-${frame * SPRITE_DISPLAY}px 0px`,  // step in scaled pixels
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          backgroundSize: `${FRAMES * SPRITE_DISPLAY}px ${SPRITE_DISPLAY}px`, // scale full sheet
          
        }}
      />
    </div>
  );
}