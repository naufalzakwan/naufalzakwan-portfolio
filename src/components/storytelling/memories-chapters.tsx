"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MemoriesChapters() {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>("[data-memories-chapters]");
    const stage = root?.querySelector<HTMLElement>("[data-memory-stage]");
    const stack = root?.querySelector<HTMLElement>("[data-memory-stack]");
    if (!root || !stage || !stack) return;
    const chapters = [...root.querySelectorAll<HTMLElement>("[data-memory-chapter]")];
    const contents = [...root.querySelectorAll<HTMLElement>("[data-memory-content]")];
    const photos = [...root.querySelectorAll<HTMLElement>("[data-memory-photo]")];
    const copies = [...root.querySelectorAll<HTMLElement>("[data-memory-copy]")];
    const elements = [root, stage, stack, ...chapters, ...contents, ...photos, ...copies];
    const original = elements.map((element) => element.getAttribute("style"));
    const attributes = chapters.map((chapter) => ({ hidden: chapter.getAttribute("aria-hidden"), inert: chapter.inert }));
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference) and (min-height: 640px)", () => {
      let context: gsap.Context | undefined;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let disposed = false;
      let lastWidth = innerWidth, lastHeight = innerHeight;
      function reset() {
        context?.revert(); context = undefined;
        delete root!.dataset.motion;
        chapters.forEach((chapter, index) => {
          const saved = attributes[index];
          chapter.inert = saved.inert;
          if (saved.hidden === null) chapter.removeAttribute("aria-hidden");
          else chapter.setAttribute("aria-hidden", saved.hidden);
        });
        elements.forEach((element, index) => {
          if (original[index] === null) element.removeAttribute("style");
          else element.setAttribute("style", original[index]!);
        });
      }
      function build() {
        if (disposed) return;
        reset();
        const desktop = innerWidth >= 896;
        const height = innerHeight;
        root!.dataset.motion = "active";
        root!.style.setProperty("--memory-stage-height", `${height}px`);
        const copyHeight = Math.max(...copies.map((copy) => copy.offsetHeight));
        const photoHeight = desktop ? Math.min(height - 80, 720) : Math.min(height * .46, height - copyHeight - 88, 420);
        if (photoHeight < 190 || copyHeight > height - 64) { reset(); requestScrollRefresh(); return; }
        root!.style.setProperty("--memory-photo-height", `${photoHeight}px`);
        const contentHeight = desktop ? Math.max(photoHeight, copyHeight) : photoHeight + copyHeight + 24;
        root!.style.setProperty("--memory-content-height", `${contentHeight}px`);
        context = gsap.context(() => {
          // The viewport stage and bounded stack remain stationary. Only each
          // photo/copy pair moves inside the content-sized clipping area.
          chapters.forEach((chapter, index) => gsap.set(chapter, { zIndex: index + 1 }));
          contents.forEach((content, index) => gsap.set(content, { yPercent: index === 0 ? 0 : 100 }));
          if (!desktop) {
            gsap.set(contents, { alignContent: "start", alignItems: "start", gridTemplateRows: `${photoHeight}px ${copyHeight}px`, rowGap: 24 });
          }
          const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });
          for (let index = 1; index < chapters.length; index++) {
            timeline.to(contents[index], { yPercent: 0, duration: 1 }, index - 1);
          }
          function syncActive(progress: number) {
            // Accessibility follows the most visible card; this never changes
            // the visual layers or replaces their content during a transition.
            const active = Math.min(chapters.length - 1, Math.floor(progress * (chapters.length - 1) + .5));
            chapters.forEach((chapter, index) => {
              chapter.inert = index !== active;
              chapter.setAttribute("aria-hidden", String(index !== active));
            });
          }
          const trigger = ScrollTrigger.create({
            id: "memories-chapters", trigger: stage!, pin: true, refreshPriority: -2, start: "top top",
            end: () => `+=${height * (chapters.length - 1)}`, animation: timeline, scrub: true, anticipatePin: 1,
            onUpdate: (self) => syncActive(self.progress),
            onRefresh: (self) => syncActive(self.progress),
          });
          syncActive(trigger.progress);
        }, root!);
        requestScrollRefresh();
      }
      function resize() {
        if (innerWidth === lastWidth && Math.abs(innerHeight - lastHeight) < 80) return;
        lastWidth = innerWidth; lastHeight = innerHeight;
        clearTimeout(timer); timer = setTimeout(build, 140);
      }
      document.fonts.ready.then(() => { if (!disposed) build(); });
      document.fonts.addEventListener("loadingdone", build);
      window.addEventListener("resize", resize);
      return () => {
        disposed = true; clearTimeout(timer); reset();
        document.fonts.removeEventListener("loadingdone", build);
        window.removeEventListener("resize", resize);
        requestScrollRefresh();
      };
    });
    return () => media.revert();
  }, []);
  return null;
}
