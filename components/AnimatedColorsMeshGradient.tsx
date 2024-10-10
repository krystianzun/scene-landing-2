"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./AnimaedColorsMeshGradient.module.css";

interface Color {
  r: number;
  g: number;
  b: number;
}

const colors: Color[] = [
  { r: 1.0, g: 0.42, b: 0.42 },
  { r: 1.0, g: 0.55, b: 0.0 },
  { r: 1.0, g: 0.27, b: 0.0 },
  { r: 1.0, g: 0.41, b: 0.71 },
  { r: 0.85, g: 0.44, b: 0.84 },
  { r: 0.54, g: 0.17, b: 0.89 },
  { r: 0.29, g: 0.0, b: 0.51 },
  { r: 0.0, g: 0.0, b: 0.55 },
  { r: 0.1, g: 0.1, b: 0.44 },
];

const points = [
  { x: 0, y: 0 },
  { x: 0.5, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 0.5 },
  { x: 0.5, y: 0.5 },
  { x: 1, y: 0.5 },
  { x: 0, y: 1 },
  { x: 0.5, y: 1 },
  { x: 1, y: 1 },
];

const AnimatedColorsMeshGradient: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setAnimationFrame] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = (time: number) => {
      const animatedColors = colors.map((color, index) => {
        const hueShift = Math.cos(time * 0.001 + index * 0.3) * 0.1;
        return shiftHue(color, hueShift);
      });

      drawMeshGradient(ctx, animatedColors);
      setAnimationFrame(requestAnimationFrame(animate));
    };

    const animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const shiftHue = (color: Color, amount: number): Color => {
    const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
    const newHue = (h + amount + 1) % 1;
    const [r, g, b] = hslToRgb(newHue, s, l);
    return { r, g, b };
  };

  const drawMeshGradient = (ctx: CanvasRenderingContext2D, colors: Color[]) => {
    const { width, height } = ctx.canvas;

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const index = i * 3 + j;
        const gradient = ctx.createRadialGradient(
          points[index].x * width,
          points[index].y * height,
          0,
          points[index].x * width,
          points[index].y * height,
          width / 2
        );

        gradient.addColorStop(
          0,
          `rgb(${colors[index].r * 255}, ${colors[index].g * 255}, ${
            colors[index].b * 255
          })`
        );
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
};

// Helper functions for color conversion
function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 3) return q;
      if (t < 1 / 2) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}

export default AnimatedColorsMeshGradient;
