"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh";
import { createViewportResizeHandler } from "@/lib/viewport-resize";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function AboutChapterSequence() {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>("[data-about-chapters]");
    const stage = root?.querySelector<HTMLElement>("[data-about-chapter-stage]");
    if (!root || !stage) return;
    const chapters = Array.from(root.querySelectorAll<HTMLElement>("[data-about-chapter]"));
    const photos = chapters.map((chapter) => chapter.querySelector<HTMLElement>("[data-about-chapter-photo]")!);
    const copies = chapters.map((chapter) => chapter.querySelector<HTMLElement>("[data-about-chapter-copy]")!);
    const texts = chapters.map((chapter) => chapter.querySelector<HTMLElement>("[data-about-chapter-text]")!);
    const words = chapters.map((chapter) => Array.from(chapter.querySelectorAll<HTMLElement>("[data-about-chapter-word]")));
    const elements = [stage, ...chapters, ...photos, ...copies, ...texts, ...words.flat()];
    const styles = elements.map((element) => element.getAttribute("style"));
    const attributes = chapters.map((chapter) => ({ hidden: chapter.getAttribute("aria-hidden"), inert: chapter.inert }));
    function visibleReadingStart(element: HTMLElement) {
      const header = parseFloat(getComputedStyle(document.documentElement).fontSize) * 4.5;
      // Tall mobile chapters cannot fit in one viewport: measure against the
      // available reading area rather than requiring 78% of an oversized block.
      const visibleHeight = Math.min(element.offsetHeight, Math.max(1, innerHeight - header));
      return `top ${innerHeight - visibleHeight * .78}px`;
    }
    const media = gsap.matchMedia();
    media.add({
      animate: "(prefers-reduced-motion: no-preference)",
      compact: "(max-width: 1023px)",
    }, (match) => {
      if (!match.conditions?.animate) return;
      const compact = Boolean(match.conditions.compact);
      let context: gsap.Context | undefined;
      let disposed = false, frame = 0;
      let timer: ReturnType<typeof setTimeout>;
      function reset() {
        context?.revert(); context = undefined;
        delete stage!.dataset.chapterLayout; delete stage!.dataset.activeChapter;
        delete stage!.dataset.chapterScrollStart; delete stage!.dataset.chapterScrollEnd;
        chapters.forEach(chapter => {
          delete chapter.dataset.readingStart; delete chapter.dataset.readingEnd;
          delete chapter.dataset.transitionStart; delete chapter.dataset.transitionEnd;
        });
        elements.forEach((element, index) => {
          const original = styles[index];
          if (original === null) element.removeAttribute("style"); else element.setAttribute("style", original);
        });
        chapters.forEach((chapter, index) => {
          const original = attributes[index];
          chapter.inert = original.inert;
          if (original.hidden === null) chapter.removeAttribute("aria-hidden"); else chapter.setAttribute("aria-hidden", original.hidden);
        });
      }
      function build() {
        if (disposed || !stage!.isConnected) return;
        reset();
        const header = parseFloat(getComputedStyle(document.documentElement).fontSize) * 4.5;
        const height = innerHeight - header;
        stage!.style.setProperty("--about-stage-height", `${height}px`);
        stage!.dataset.chapterLayout = "measuring";
        // Measure natural content before deciding how much vertical padding fits.
        // Long paragraphs must never silently disable the chapter sequence.
        chapters.forEach(chapter => {
          chapter.style.bottom = "auto";
          chapter.style.height = "auto";
          chapter.style.paddingBlock = "0px";
        });
        // Leave room for font ink extending beyond the final line box.
        const naturalHeights = chapters.map(chapter => chapter.offsetHeight + 4);
        const padding = Math.min(32, Math.max(0, (height - Math.max(...naturalHeights)) / 2));
        const overflows = naturalHeights.map((naturalHeight, index) => {
          const chapterHeight = Math.max(height, naturalHeight + padding * 2);
          chapters[index].style.height = `${chapterHeight}px`;
          chapters[index].style.paddingBlock = `${padding}px`;
          return Math.max(0, chapterHeight - height);
        });
        const readings = words.map((chapterWords, index) => Math.max(height * .85, chapterWords.length * 22, overflows[index] * 1.5));
        const hold = Math.max(80, height * .12);
        const fade = Math.max(120, height * .18);
        const phases: { start: number; readEnd: number; fadeStart: number; end: number }[] = [];
        let distance = 0;
        readings.forEach((reading, index) => {
          const readEnd = distance + reading;
          const fadeStart = readEnd + hold;
          const end = fadeStart + (index < chapters.length - 1 ? fade : 0);
          phases.push({ start: distance, readEnd, fadeStart, end });
          distance = end;
        });
        let activeChapter = -1;
        function syncActive(time: number) {
          const active = phases.reduce((active, phase, index) => index < phases.length - 1 && time >= (phase.fadeStart + phase.end) / 2 ? index + 1 : active, 0);
          if (active === activeChapter) return;
          activeChapter = active;
          stage!.dataset.activeChapter = String(active + 1).padStart(2, "0");
          chapters.forEach((chapter, index) => {
            chapter.inert = index !== active;
            chapter.setAttribute("aria-hidden", String(index !== active));
          });
        }
        try {
          context = gsap.context(() => {
            const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });
            // The active-stage CSS already supplies the exact initial word
            // color/blur. Avoid reading and rewriting every offscreen word.
            phases.forEach((phase, index) => {
              const reading = readings[index];
              // Fade one paragraph, not dozens of filtered word layers on touch layouts.
              if (compact && index > 0) timeline.fromTo(texts[index], { opacity: 0, y: 8 }, {
                opacity: 1, y: 0, duration: Math.min(140, reading * .2), ease: "power2.out",
              }, phase.start);
              else if (index > 0) timeline.to(words[index], {
                color: "#FFFFFF", filter: "blur(0px)", opacity: 1,
                duration: reading * .22, stagger: { amount: reading * .78 },
              }, phase.start);
              // On small/tall layouts, scroll the overflowing chapter inside
              // the same clipped stage so the final lines remain readable.
              if (overflows[index] > 0) timeline.to(chapters[index], { y: -overflows[index], duration: reading }, phase.start);
              if (index === chapters.length - 1) return;
              timeline.to(photos[index], { opacity: 0, duration: fade }, phase.fadeStart)
                .to(photos[index + 1], { opacity: 1, duration: fade }, phase.fadeStart)
                .to(copies[index], { opacity: 0, y: -10, duration: fade / 2 }, phase.fadeStart)
                .to(copies[index + 1], { opacity: 1, y: 0, duration: fade / 2 }, phase.fadeStart + fade / 2);
            });
            timeline.to({}, { duration: hold }, phases[phases.length - 1].readEnd);
            stage!.dataset.chapterLayout = "active";
            // This new pin precedes Pontianak/family in document order. Refresh
            // it first so their measurements include its added scroll distance.
            const trigger = ScrollTrigger.create({ id: "about-chapter-sequence", trigger: stage, pin: stage, refreshPriority: 1,
              start: `top ${header}px`, end: `+=${distance}`, animation: timeline, scrub: true, anticipatePin: 1,
              onUpdate: (self) => syncActive(self.progress * distance),
              onRefresh: (self) => {
                stage!.dataset.chapterScrollStart = String(self.start);
                stage!.dataset.chapterScrollEnd = String(self.end);
                phases.forEach((phase, index) => {
                  chapters[index].dataset.readingStart = String(self.start + phase.start);
                  chapters[index].dataset.readingEnd = String(self.start + phase.readEnd);
                  chapters[index].dataset.transitionStart = String(self.start + phase.fadeStart);
                  chapters[index].dataset.transitionEnd = String(self.start + phase.end);
                });
                syncActive(self.progress * distance);
              },
            });
            trigger.refresh();
            // The first reading begins during entrance and finishes before its
            // hold/fade; later readings belong to the shared pinned timeline.
            if (compact) gsap.fromTo(texts[0], { opacity: 0, y: 8 }, {
              opacity: 1, y: 0, ease: "power2.out",
              scrollTrigger: {
                id: "about-first-reading", trigger: texts[0],
                start: "top 98%", end: "top 80%", scrub: true, invalidateOnRefresh: true,
              },
            });
            else gsap.to(words[0], {
              color: "#FFFFFF", filter: "blur(0px)", opacity: 1,
              duration: readings[0] * .22, stagger: { amount: readings[0] * .78 }, ease: "none",
              scrollTrigger: {
                id: "about-first-reading", trigger: stage,
                start: () => visibleReadingStart(stage!),
                end: () => trigger.start + phases[0].readEnd,
                scrub: true, invalidateOnRefresh: true,
              },
            });
            trigger.update(); timeline.totalProgress(trigger.progress, true); syncActive(trigger.progress * distance);
          }, root!);
          requestScrollRefresh();
        } catch (error) { reset(); throw error; }
      }
      function scheduleBuild() {
        clearTimeout(timer); cancelAnimationFrame(frame);
        timer = setTimeout(() => { frame = requestAnimationFrame(build); }, 100);
      }
      const onResize = createViewportResizeHandler(scheduleBuild);
      document.fonts.ready.then(() => { if (!disposed) scheduleBuild(); });
      document.fonts.addEventListener("loadingdone", scheduleBuild);
      window.addEventListener("resize", onResize);
      return () => {
        disposed = true; clearTimeout(timer); cancelAnimationFrame(frame);
        document.fonts.removeEventListener("loadingdone", scheduleBuild);
        window.removeEventListener("resize", onResize);
        reset(); requestScrollRefresh();
      };
    });
    return () => media.revert();
  });
  return null;
}
