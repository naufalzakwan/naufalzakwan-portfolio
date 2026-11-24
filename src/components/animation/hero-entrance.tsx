"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export function HeroEntrance() {
  const completed = useRef(false);

  useGSAP((_, contextSafe) => {
    const hero = document.getElementById("hero");
    if (!hero || !contextSafe) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const title = hero.querySelector<HTMLElement>("[data-hero-entrance='title']");
    const controls = Array.from(document.querySelectorAll<HTMLElement>("[data-hero-entrance='identity'], [data-hero-entrance='menu']"));
    const roles = Array.from(hero.querySelectorAll<HTMLElement>("[data-hero-entrance='role']"));
    const years = Array.from(hero.querySelectorAll<HTMLElement>("[data-hero-entrance='year']"));
    if (!title) return;
    const foreground = [title, ...controls, ...roles, ...years];
    const originalStyles = foreground.map(element => element.getAttribute("style"));
    let disposed = false;
    let timeline: gsap.core.Timeline | undefined;
    let readyTimer: ReturnType<typeof setTimeout> | undefined;

    function finish() {
      timeline?.kill();
      clearTimeout(readyTimer);
      readyTimer = undefined;
      foreground.forEach((element, index) => {
        const original = originalStyles[index];
        if (original === null) element.removeAttribute("style"); else element.setAttribute("style", original);
      });
      hero!.dataset.heroIntro = "complete";
      completed.current = true;
      motion.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocus);
    }

    // Preserve restored scroll positions and deep links without replaying offscreen.
    if (completed.current || motion.matches || hero.getBoundingClientRect().bottom <= 0) {
      finish();
      return;
    }

    hero.dataset.heroIntro = "running";
    gsap.set(title, { scale: 1.18, x: -18, y: -16, opacity: 0, filter: "blur(10px)", transformOrigin: "left top" });
    gsap.set(controls, { scale: 1.14, y: -6, opacity: 0, filter: "blur(4px)", transformOrigin: "center center" });
    gsap.set(roles, { scale: 1.12, x: 18, opacity: 0, filter: "blur(5px)", transformOrigin: "left center" });
    gsap.set(years, { scale: 1.2, x: -12, y: 10, opacity: 0, filter: "blur(8px)", transformOrigin: "left center" });

    const start = contextSafe(() => {
      if (disposed || completed.current) return;
      clearTimeout(readyTimer);
      readyTimer = undefined;
      timeline = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: finish });
      timeline.to(title, { scale: 1, x: 0, y: 0, opacity: 1, filter: "blur(0px)", duration: 1.18 }, .14)
        .to(controls, { scale: 1, y: 0, opacity: 1, filter: "blur(0px)", duration: .75, stagger: .04 }, .4)
        .to(roles, { scale: 1, x: 0, opacity: 1, filter: "blur(0px)", duration: .9, stagger: .12 }, .64)
        .to(years, { scale: 1, x: 0, y: 0, opacity: 1, filter: "blur(0px)", duration: 1, stagger: .14 }, .98);
    });
    // Keep the existing readiness window and foreground entrance timings.
    // No page scrolling or dimensions are changed.
    const image = hero.querySelector<HTMLImageElement>("img");
    readyTimer = setTimeout(start, 250);
    Promise.allSettled([document.fonts.ready, image?.decode()]).then(() => {
      if (!disposed && !timeline && !completed.current) start();
    });

    function onMotionChange() { if (motion.matches) finish(); }
    function onScroll() { if (hero!.getBoundingClientRect().bottom <= 0) finish(); }
    function onFocus() { finish(); }
    motion.addEventListener("change", onMotionChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocus, { once: true });
    return () => {
      disposed = true;
      clearTimeout(readyTimer);
      timeline?.kill();
      motion.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocus);
      delete hero.dataset.heroIntro;
    };
  }, []);

  return null;
}
