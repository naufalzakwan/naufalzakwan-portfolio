"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getNoteCoverScale } from "./music-note-coverage";
import noteSurface from "./music-note-surface.json";
import styles from "./process-section.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Exact alpha profile of the unchanged WebP; generated before shipping instead
// of decoding/readback of a 1024×1536 canvas on the mobile main thread.
const surface = { width: noteSurface.width, height: noteSurface.height, halfWidths: new Float64Array(noteSurface.height / 2) };
let surfaceRow = 0;
for (const [count, halfWidth] of noteSurface.runs) {
  surface.halfWidths.fill(halfWidth, surfaceRow, surfaceRow + count);
  surfaceRow += count;
}

export function MusicNote() {
  const noteRef = useRef<HTMLImageElement>(null);
  useGSAP(() => {
    const note = noteRef.current;
    const stage = note?.closest<HTMLElement>("[data-music-note-stage]");
    const bridge = stage?.querySelector<HTMLElement>("[data-music-note-bridge]");
    const scene = stage?.closest<HTMLElement>("[data-music-scene]");
    const runway = scene?.nextElementSibling as HTMLElement | null;
    const statement = scene?.querySelector<HTMLElement>("#music-statement");
    const copy = statement?.querySelector<HTMLElement>("[data-music-statement-copy]");
    if (!note || !stage || !bridge || !scene || !statement || !copy || !runway?.hasAttribute("data-music-scroll-runway")) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      scene.setAttribute("data-music-scene-active", "");
      let measuringActive = true;
      // Match the stable 100svh stage, not the changing browser-toolbar height.
      const getScrollDistance = () => stage.clientHeight * (window.innerWidth < 768 ? 3 : 3.6) * 1.64 / 1.24;
      const measureRunway = () => {
        if (measuringActive) runway.style.height = `${getScrollDistance()}px`;
      };
      measureRunway();
      gsap.set(bridge, { opacity: 0 });
      gsap.set(statement, { autoAlpha: 0 });
      gsap.set(copy, { autoAlpha: 0, y: 18, scale: 0.95 });
      statement.inert = true;
      statement.setAttribute("aria-hidden", "true");
      let readingPhase = "";
      const syncReading = (time: number) => {
        const phase = time >= 1.36 ? "ready" : time > 1.08 ? "copy" : time > 1 ? "surface" : "";
        if (phase === readingPhase) return;
        readingPhase = phase;
        const readable = time > 1.08;
        statement.inert = !readable;
        if (readable) statement.removeAttribute("aria-hidden");
        else statement.setAttribute("aria-hidden", "true");
        if (time >= 1.36) scene.setAttribute("data-music-reading", "ready");
        else if (time > 1) scene.setAttribute("data-music-reading", "fading");
        else scene.removeAttribute("data-music-reading");
      };
      let coverageScale = 1;
      const getCoverageScale = () => {
        // Verified solid material around the centre of the 1024 × 1536 asset:
        // x=472..552, y=648..888. Transparent padding/flag gaps cannot cover a screen.
        const imageWidth = Math.min(note.offsetWidth, note.offsetHeight * 1024 / 1536);
        const viewportWidth = stage.clientWidth;
        const viewportHeight = stage.clientHeight;
        coverageScale = getNoteCoverScale(surface, imageWidth, viewportWidth, viewportHeight);
        return coverageScale;
      };
      // One reversible scroll scene; no canvas, timers or continuous draw loop.
      gsap.timeline({ onUpdate: function () { syncReading(this.time()); }, scrollTrigger: {
        // Measure the normal-flow runway rather than the moving sticky box.
        id: "music-note-intro", trigger: runway, start: () => `top ${stage.offsetHeight}px`,
        // Preserve the existing physical zoom distance (1 / 1.24 of the old
        // zoom-and-colour scene), followed by a pinned reading interval.
        end: () => `+=${getScrollDistance()}`,
        onRefreshInit: measureRunway,
        scrub: window.matchMedia("(hover: none) and (pointer: coarse)").matches ? 0.2 : 0.8,
        invalidateOnRefresh: true,
      } })
        .fromTo(note, { scale: 1, autoAlpha: 1 }, {
          scale: getCoverageScale,
          duration: 1,
          // Geometric zoom keeps the large scale range gradual rather than
          // spending the opening scroll on a sudden leap to an enormous note.
          ease: (progress: number) => {
            // Constant proportional enlargement: no near-zero-speed opening.
            return coverageScale > 1 ? Math.expm1(Math.log(coverageScale) * progress) / (coverageScale - 1) : progress;
          },
        }, 0)
        .addLabel("surface-covered", 1)
        // The beige surface and copy cannot overtake the completed zoom.
        // One reversible clock also handles fast scroll and refresh correctly.
        .to(bridge, { opacity: 1, duration: 0.08, ease: "sine.inOut" }, 1)
        .set(statement, { autoAlpha: 1 }, 1.08)
        .to(copy, { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: "power2.out" }, 1.08)
        .to({}, { duration: 0.28 }, 1.36);

      return () => {
        measuringActive = false;
        runway.style.removeProperty("height");
        scene.removeAttribute("data-music-scene-active");
        scene.removeAttribute("data-music-reading");
        statement.inert = false;
        statement.removeAttribute("aria-hidden");
      };
    });
    return () => media.revert();
  });
  return <><Image alt="Not musik berwarna cream dengan material enamel vintage" className={styles.note}
    ref={noteRef} src="/images/music/vintage-note-d2ae83.webp" width={1024} height={1536}
    unoptimized />
    <span aria-hidden="true" className={styles.bridge} data-music-note-bridge />
  </>;
}
