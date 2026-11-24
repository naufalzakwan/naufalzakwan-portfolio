import { ScrollTrigger } from "gsap/ScrollTrigger";

let frame = 0;

/** Batch full-page measurements after independent scenes finish their layout. */
export function requestScrollRefresh() {
  if (frame || typeof window === "undefined") return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
}
