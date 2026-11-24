"use client";

import { useLayoutEffect } from "react";

/** Fit the existing badge as one proportional object; its artwork stays intact. */
export function LanyardLayout() {
  useLayoutEffect(() => {
    const hanger = document.querySelector<HTMLElement>("[data-profile-hanger]");
    const badge = hanger?.querySelector<HTMLElement>("[data-profile-badge]");
    if (!hanger || !badge) return;
    const originalStyle = hanger.getAttribute("style");
    let frame = 0;
    let disposed = false;

    function measure() {
      if (disposed || !hanger!.isConnected) return;
      const height = window.innerHeight;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const topClearance = Math.min(4.5 * rem + 16, height * .2);
      const bottomClearance = Math.max(24, height * .035);
      const availableHeight = Math.max(1, height - topClearance - bottomClearance);
      // offsetHeight is unaffected by the transform applied below, preventing
      // a resize feedback loop. Keep the original size whenever it already fits.
      const naturalHeight = badge!.offsetHeight;
      if (!naturalHeight) return;
      const scale = Math.min(1, availableHeight / naturalHeight);
      const visualHeight = naturalHeight * scale;
      const top = topClearance + (availableHeight - visualHeight) / 2;
      const values: Record<string, string> = {
        "--lanyard-top": `${top.toFixed(3)}px`,
        "--profile-scale": String(scale),
        "--profile-block-height": `${visualHeight.toFixed(3)}px`,
      };
      Object.entries(values).forEach(([key, value]) => {
        if (hanger!.style.getPropertyValue(key) !== value) hanger!.style.setProperty(key, value);
      });
    }
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }
    const observer = new ResizeObserver(schedule);
    observer.observe(hanger);
    observer.observe(badge);
    measure();
    window.addEventListener("resize", schedule);
    document.fonts.addEventListener("loadingdone", schedule);
    document.fonts.ready.then(() => { if (!disposed) schedule(); });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      document.fonts.removeEventListener("loadingdone", schedule);
      if (originalStyle === null) hanger.removeAttribute("style");
      else hanger.setAttribute("style", originalStyle);
    };
  }, []);
  return null;
}
