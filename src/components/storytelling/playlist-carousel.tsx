"use client";

import { useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh";
import { createViewportResizeHandler } from "@/lib/viewport-resize";
import { scrollPageTo } from "@/lib/smooth-scroll";
import styles from "./playlist-archive.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function PlaylistCarousel({ children }: { children: ReactNode }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useGSAP(() => {
    const shell = shellRef.current, rail = railRef.current;
    const track = rail?.querySelector<HTMLElement>("[data-cd-track]");
    if (!shell || !rail || !track) return;
    const originalWidth = shell.style.getPropertyValue("--gallery-width");
    const originalTrackStyle = track.getAttribute("style");
    const items = Array.from(track.querySelectorAll<HTMLElement>("[data-cd-item]"));
    const originalItemStyles = items.map(item => item.getAttribute("style"));
    // Use the usable viewport width, excluding native scrollbars.
    const updateWidth = () => shell.style.setProperty("--gallery-width", `${document.documentElement.clientWidth}px`);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference) and (min-height: 600px)", () => {
      let context: gsap.Context | undefined;
      let disposed = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      function reset() {
        context?.revert(); context = undefined;
        if (originalTrackStyle === null) track!.removeAttribute("style");
        else track!.setAttribute("style", originalTrackStyle);
        items.forEach((item, index) => {
          const style = originalItemStyles[index];
          if (style === null) item.removeAttribute("style");
          else item.setAttribute("style", style);
          delete item.dataset.cdState;
          item.removeAttribute("aria-current");
        });
        triggerRef.current = null;
        delete shell!.dataset.cdMotion;
      }
      function build() {
        if (disposed) return;
        reset(); updateWidth();
        rail!.scrollLeft = 0;
        context = gsap.context(() => {
          shell!.dataset.cdMotion = "active";
          const width = rail!.clientWidth, height = rail!.clientHeight;
          const mobile = width < 768;
          const diameter = Math.min(width * (mobile ? .82 : .56), height * .78, 800);
          // Circular silhouettes keep the same radius when rotated. Reserve
          // additional room for the existing 12px offset / 12px blur shadow.
          const safeMargin = gsap.utils.clamp(24, 40, width * .025);
          const radius = diameter / 2;
          const focused = {
            x: gsap.utils.clamp(radius + safeMargin, width - radius - safeMargin, width * .5),
            y: height - radius - safeMargin,
          };
          // Try the original companion size first. Only compact viewports need
          // a smaller next disc to show both complete circles without overlap.
          const fitsNext = (scale: number) => {
            const nextRadius = radius * scale;
            const x = width - nextRadius - safeMargin, y = nextRadius + safeMargin;
            return Math.hypot(x - focused.x, y - focused.y) >= radius + nextRadius + 12;
          };
          let nextScale = .86;
          if (!fitsNext(nextScale)) {
            let low = 0, high = nextScale;
            for (let step = 0; step < 16; step++) {
              const middle = (low + high) / 2;
              if (fitsNext(middle)) low = middle;
              else high = middle;
            }
            nextScale = low;
          }
          // Slots describe disc centres. Only the current and neighbouring discs
          // enter the stage; the rest remain queued outside its clipping edge.
          const slots = [
            { x: -diameter * .65, y: height * .77, scale: .5, rotation: -24 },
            { x: width * (mobile ? -.06 : .12), y: height * .73, scale: .66, rotation: -17 },
            { ...focused, scale: 1, rotation: -8 },
            { x: width - radius * nextScale - safeMargin, y: radius * nextScale + safeMargin, scale: nextScale, rotation: 12 },
            { x: width + diameter * 1.1, y: height * .1, scale: .74, rotation: 19 },
          ];
          const playhead = { position: 0 };
          const wasVisible = items.map(() => true);
          gsap.set(items, { width: diameter, xPercent: -50, yPercent: -50, transformOrigin: "50% 50%" });
          function render() {
            const focusedIndex = Math.round(playhead.position);
            items.forEach((item, index) => {
              const relative = index - playhead.position;
              const slot = gsap.utils.clamp(0, 4, relative + 2);
              const lower = Math.min(3, Math.floor(slot));
              const fraction = slot - lower;
              const from = slots[lower], to = slots[lower + 1];
              const mix = (a: number, b: number) => a + (b - a) * fraction;
              const opacity = gsap.utils.clamp(0, 1, (2 - Math.abs(relative)) * 2);
              // Invisible queued discs need no per-frame transform work. Write
              // the exact current pose before a disc becomes visible again.
              if (opacity > 0 || wasVisible[index]) {
                gsap.set(item, {
                  x: mix(from.x, to.x) + Math.max(0, relative - 2) * diameter * .8,
                  y: mix(from.y, to.y),
                  scale: mix(from.scale, to.scale), rotation: mix(from.rotation, to.rotation),
                  zIndex: 20 - Math.round(Math.abs(relative) * 2),
                  autoAlpha: opacity,
                });
              }
              wasVisible[index] = opacity > 0;
              // State labels identify the nearest scene; geometry always uses
              // fractional progress, so crossing a label never snaps a disc.
              const state = index === focusedIndex ? "focused" : index < focusedIndex ? (relative <= -2 ? "off-left" : "previous") : index === focusedIndex + 1 ? "next" : "queued-right";
              if (item.dataset.cdState !== state) item.dataset.cdState = state;
              if (focusedIndex === index && !item.hasAttribute("aria-current")) item.setAttribute("aria-current", "true");
              else if (focusedIndex !== index && item.hasAttribute("aria-current")) item.removeAttribute("aria-current");
            });
          }
          render();
          const tween = gsap.to(playhead, {
            position: items.length - 1, ease: "none", onUpdate: render,
            scrollTrigger: {
              id: "playlist-cd-gallery", trigger: shell!, pin: shell!,
              start: "top 32px", end: `+=${Math.round((items.length - 1) * Math.max(300, height * .75))}`,
              scrub: .35, anticipatePin: 1, invalidateOnRefresh: true,
            },
          });
          triggerRef.current = tween.scrollTrigger ?? null;
        }, shell!);
        ScrollTrigger.sort(); requestScrollRefresh();
      }
      function scheduleBuild() { clearTimeout(timer); timer = setTimeout(build, 120); }
      const onResize = createViewportResizeHandler(scheduleBuild);
      document.fonts.ready.then(() => { if (!disposed) scheduleBuild(); });
      document.fonts.addEventListener("loadingdone", scheduleBuild);
      window.addEventListener("resize", onResize);
      return () => {
        disposed = true; clearTimeout(timer);
        window.removeEventListener("resize", onResize);
        document.fonts.removeEventListener("loadingdone", scheduleBuild);
        reset(); requestScrollRefresh();
      };
    });
    return () => {
      media.revert(); window.removeEventListener("resize", updateWidth);
      if (originalWidth) shell.style.setProperty("--gallery-width", originalWidth);
      else shell.style.removeProperty("--gallery-width");
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const trigger = triggerRef.current;
    if (trigger) {
      const progress = event.key === "Home" ? 0 : event.key === "End" ? 1 : Math.max(0, Math.min(1, trigger.progress + (event.key === "ArrowRight" ? 1 : -1) / 7));
      scrollPageTo(trigger.start + (trigger.end - trigger.start) * progress, true);
    } else {
      const rail = railRef.current;
      if (!rail) return;
      const left = event.key === "Home" ? 0 : event.key === "End" ? rail.scrollWidth - rail.clientWidth : rail.scrollLeft + (event.key === "ArrowRight" ? 1 : -1) * rail.clientWidth * .75;
      rail.scrollTo({ left, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
  }

  return (
    <div className={styles.shell} data-cd-gallery ref={shellRef}>
      <div aria-label="Galeri delapan keping CD dalam playlist saya" className={styles.rail} id="playlist-archive-gallery" onKeyDown={onKeyDown} ref={railRef} role="region" tabIndex={0}>
        {children}
      </div>
    </div>
  );
}
