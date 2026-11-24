"use client";

import { useEffect, useRef } from "react";

import styles from "./circle-cursor.module.css";

// Time constant in milliseconds: increase for more lag, decrease for a tighter
// follow. Time-based interpolation keeps the feel consistent at 60/120/144 Hz.
const FOLLOW_TIME_MS = 240;
const SETTLE_DISTANCE_PX = 0.05;

export function CircleCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    // Keep native cursors when the browser cannot put this decorative layer
    // above modal dialogs without changing their focus or interaction model.
    if (!cursor || typeof cursor.showPopover !== "function") return;

    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previousTime = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let visible = false;

    function hide() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      visible = false;
      if (cursor!.matches(":popover-open")) cursor!.hidePopover();
    }

    function draw(time: number) {
      frame = 0;
      const elapsed = Math.min(Math.max(time - previousTime, 0), 64);
      previousTime = time;
      const blend = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / FOLLOW_TIME_MS);
      x += (targetX - x) * blend;
      y += (targetY - y) * blend;
      const settled = Math.hypot(targetX - x, targetY - y) <= SETTLE_DISTANCE_PX;
      if (settled) {
        x = targetX;
        y = targetY;
      }
      cursor!.style.transform = `translate3d(${x - 9}px, ${y - 9}px, 0)`;
      if (!visible) {
        cursor!.showPopover();
        visible = true;
      }
      // Continue chasing after pointer events stop, then sleep at the exact
      // target instead of running a permanent animation loop or oscillating.
      if (!settled) frame = requestAnimationFrame(draw);
      else previousTime = 0;
    }

    function move(event: PointerEvent) {
      if (!pointer.matches || event.pointerType !== "mouse") {
        hide();
        return;
      }
      targetX = event.clientX;
      targetY = event.clientY;
      // Re-entry starts at the pointer, never at a stale offscreen position.
      if (!visible) {
        x = targetX;
        y = targetY;
      }
      if (!frame) {
        previousTime = performance.now();
        frame = requestAnimationFrame(draw);
      }
    }

    function leave(event: PointerEvent) {
      if (event.relatedTarget === null) hide();
    }

    function pointerDown(event: PointerEvent) {
      if (event.pointerType !== "mouse") hide();
    }

    function visibilityChange() {
      if (document.hidden) hide();
    }

    // Re-enter the top layer after a dialog opens. This is a non-interactive,
    // manual popover: it never takes focus, traps keys, or locks scrolling.
    const dialogs = new MutationObserver(() => {
      if (!visible) return;
      cursor!.hidePopover();
      cursor!.showPopover();
    });
    dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });
    document.addEventListener("pointerdown", pointerDown, { passive: true });
    document.addEventListener("pointercancel", hide, { passive: true });
    document.addEventListener("visibilitychange", visibilityChange);
    window.addEventListener("blur", hide);
    pointer.addEventListener("change", hide);
    reducedMotion.addEventListener("change", hide);

    return () => {
      hide();
      dialogs.disconnect();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("pointerdown", pointerDown);
      document.removeEventListener("pointercancel", hide);
      document.removeEventListener("visibilitychange", visibilityChange);
      window.removeEventListener("blur", hide);
      pointer.removeEventListener("change", hide);
      reducedMotion.removeEventListener("change", hide);
    };
  }, []);

  return <div aria-hidden="true" className={styles.cursor} data-circle-cursor-layer popover="manual" ref={cursorRef} />;
}
