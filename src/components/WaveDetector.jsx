// WaveDetector.js
import React, { useEffect, useRef, useState } from "react";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs-backend-webgl";

export default function WaveDetector({ onWave }) {
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    async function setup() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const handposeModel = await handpose.load();
      setModel(handposeModel);
    }
    setup();
  }, []);

  useEffect(() => {
    if (!model) return;

    let lastX = null;
    let movementCount = 0;
    let direction = null;

    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const predictions = await model.estimateHands(videoRef.current);
      if (predictions.length > 0) {
        const x = predictions[0].landmarks[9][0]; // middle finger base x-pos

        if (lastX !== null) {
          if (x > lastX + 10 && direction !== "right") {
            direction = "right";
            movementCount++;
          } else if (x < lastX - 10 && direction !== "left") {
            direction = "left";
            movementCount++;
          }

          if (movementCount >= 1) {
            onWave(true);
            movementCount = 0;
            direction = null;
          }
        }
        lastX = x;
      }
    }, 200);

    return () => clearInterval(interval);
  }, [model, onWave]);

  return (
  <video
    ref={videoRef}
    autoPlay
    playsInline
    muted
    style={{
      width: 320,    // set desired width
      height: 240,   // set desired height
      border: "2px solid red", // optional: visible border for debugging
    }}
  />
);
}
