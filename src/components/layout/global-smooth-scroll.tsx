"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import { attachPageScroll, updatePageHash } from "@/lib/smooth-scroll";

gsap.registerPlugin(ScrollTrigger);

/** Enhance document scroll without introducing a wrapper or another scroller. */
export function GlobalSmoothScroll() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose: (() => void) | undefined;

    function configure() {
      dispose?.();
      dispose = undefined;
      if (preference.matches) return;

      const lenis = new Lenis({
        smoothWheel: true,
        lerp: 0.08,
        wheelMultiplier: 0.85,
        touchMultiplier: 1,
        syncTouch: false,
        // Handled below so dialog navigation can finish closing before scrolling.
        anchors: false,
        autoRaf: false,
      });
      attachPageScroll(lenis);
      const tick = (seconds: number) => lenis.raf(seconds * 1000);
      const resize = () => lenis.resize();
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.addEventListener("refresh", resize);

      // Lenis handles anchor motion; suppress the browser's competing hash jump.
      function anchorClick(event: MouseEvent) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.composedPath().find(node => node instanceof HTMLAnchorElement) as HTMLAnchorElement | undefined;
        if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
        const url = new URL(link.href);
        if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
        const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (!target) return;
        event.preventDefault();
        updatePageHash(url.hash);
        lenis.scrollTo(target);
      }
      document.addEventListener("click", anchorClick);

      dispose = () => {
        document.removeEventListener("click", anchorClick);
        ScrollTrigger.removeEventListener("refresh", resize);
        gsap.ticker.remove(tick);
        lenis.off("scroll", ScrollTrigger.update);
        attachPageScroll(null);
        lenis.destroy();
      };
    }

    configure();
    preference.addEventListener("change", configure);
    return () => {
      preference.removeEventListener("change", configure);
      dispose?.();
    };
  }, []);

  return null;
}
