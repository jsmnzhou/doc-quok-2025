import React, { useEffect, useState } from "react";
import IdleSprite from "./IdleSprite";
import WalkingSprite from "./WalkingSprite";

const WALK_RANGE = { min: 100, max: 500 }; // allowed x movement
const STEP_SIZE = 4;                       // pixels per tick
const DECISION_INTERVAL = 3000;            // every 3s, reconsider state

export default function WaitingSprite({ position, setPosition, draggable, dragging }) {
  const [state, setState] = useState("idle");
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left

  // Decide randomly whether to switch states
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === "idle") {
        if (Math.random() < 0.5) {
          setState("walking");
          setDirection(Math.random() < 0.5 ? -1 : 1);
        }
      } else if (state === "walking") {
        if (Math.random() < 0.3) {
          setState("idle");
        }
      }
    }, DECISION_INTERVAL);

    return () => clearInterval(interval);
  }, [state]);

  // Move when walking
  useEffect(() => {
    if (state !== "walking") return;

    const moveInterval = setInterval(() => {
      setPosition(prev => {
        let newX = prev.x + STEP_SIZE * direction;

        // Clamp to walk range
        if (newX < WALK_RANGE.min) {
          newX = WALK_RANGE.min;
          setDirection(1); // bounce back
        } else if (newX > WALK_RANGE.max) {
          newX = WALK_RANGE.max;
          setDirection(-1);
        }

        return { ...prev, x: newX };
      });
    }, 200); // movement tick speed

    return () => clearInterval(moveInterval);
  }, [state, direction, setPosition]);

  // Render based on state
  return state === "idle" ? (
    <IdleSprite position={position} draggable={draggable} dragging={dragging} />
  ) : (
    <WalkingSprite position={position} direction={direction} draggable={draggable} dragging={dragging} />
  );
}

