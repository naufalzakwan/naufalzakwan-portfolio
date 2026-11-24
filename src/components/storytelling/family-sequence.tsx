"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh";
import { createViewportResizeHandler } from "@/lib/viewport-resize";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function FamilySequence() {
  useGSAP(() => {
    const article = document.querySelector<HTMLElement>("[data-family-story]");
    const viewport = article?.querySelector<HTMLElement>("[data-family-viewport]");
    const track = article?.querySelector<HTMLElement>("[data-family-track]");
    const visual = article?.querySelector<HTMLElement>("[data-family-visual]");
    const narrative = article?.querySelector<HTMLElement>("[data-family-narrative]");
    const titleScene = article?.querySelector<HTMLElement>("[data-family-title-scene]");
    const storyScene = article?.querySelector<HTMLElement>("[data-family-story-scene]");
    const heading = titleScene?.querySelector<HTMLElement>("#story-family-heading");
    if (!article || !viewport || !track || !visual || !narrative || !titleScene || !storyScene || !heading) return;
    const words = Array.from(narrative.querySelectorAll<HTMLElement>("[data-family-word]"));
    const wordStyles = words.map((word) => word.getAttribute("style"));
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      let context: gsap.Context | undefined;
      let disposed = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let frame = 0;

      function prepareWords() {
        words.forEach((word) => Object.assign(word.style, { color: "#777777", opacity: ".55", filter: "blur(4px)" }));
        gsap.set(heading!, { color: "#777777", filter: "blur(6px)" });
      }

      function revealWords(timeline: gsap.core.Timeline, start: number, duration: number) {
        const step = duration / words.length;
        // Each word completes before the next begins; all timing is scroll-bound.
        timeline.to(words, {
          filter: "blur(0px)", color: "#FFFFFF", opacity: 1,
          duration: step, stagger: step, ease: "none",
        }, start);
      }

      function reset() {
        context?.revert();
        context = undefined;
        words.forEach((word, index) => {
          const style = wordStyles[index];
          if (style === null) word.removeAttribute("style"); else word.setAttribute("style", style);
        });
        delete viewport!.dataset.familyLayout;
      }

      function build() {
        if (disposed || !article!.isConnected) return;
        reset();
        // Measure the exact two-panel geometry before deciding whether it fits.
        let horizontal = window.matchMedia("(min-width: 1024px)").matches;
        if (horizontal) {
          viewport!.dataset.familyLayout = "measuring";
          horizontal = [titleScene!.querySelector("h3")!, visual!, narrative!].every(element => {
            const panel = element === titleScene!.firstElementChild ? titleScene! : storyScene!;
            const bounds = element.getBoundingClientRect();
            const area = panel.getBoundingClientRect();
            return bounds.top >= area.top && bounds.bottom <= area.bottom
              && bounds.left >= area.left && bounds.right <= area.right;
          });
          if (!horizontal) delete viewport!.dataset.familyLayout;
        }

        context = gsap.context(() => {
          prepareWords();
          if (horizontal) {
            viewport!.dataset.familyLayout = "active";
            // This is the only horizontal transform and the only pin in this story.
            const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
              id: "family-story-sequence", trigger: viewport, pin: true,
              start: "top top", end: () => `+=${Math.round(viewport!.clientHeight * 4.5)}`,
              scrub: 1.2, invalidateOnRefresh: true, anticipatePin: 1,
            } });
            gsap.set(narrative!, { autoAlpha: 0 });
            timeline.to(track!, { xPercent: -50, duration: .46, force3D: true }, 0);
            // Keep the paragraph completely hidden through movement and settling.
            timeline.to(narrative!, { autoAlpha: 1, duration: .04 }, .50);
            revealWords(timeline, .54, .42);
            timeline.to({}, { duration: .04 }, .96);
            // Preserve the current reading position after fonts/resize rebuilds.
            timeline.progress(timeline.scrollTrigger!.progress, true);
          } else {
            // Small/short screens retain both panels in natural page flow.
            const reading = gsap.timeline({ scrollTrigger: {
              id: "family-words-sequence", trigger: narrative,
              start: "top 85%", end: "bottom 75%", scrub: 1.2,
            } });
            revealWords(reading, 0, 1);
          }
          // Complete the title's entrance before the viewport reaches its pin.
          // This owns only title color/blur, independently of track movement.
          gsap.fromTo(heading!, { color: "#777777", filter: "blur(6px)" }, {
            color: "#FFFFFF", filter: "blur(0px)", ease: "none",
            scrollTrigger: {
              id: "family-heading-reveal", trigger: heading,
              start: "top 95%", end: "top 60%",
              scrub: true, invalidateOnRefresh: true,
            },
          });
        }, article!);
        requestScrollRefresh();
      }

      function scheduleBuild() {
        clearTimeout(timer);
        cancelAnimationFrame(frame);
        timer = setTimeout(() => { frame = requestAnimationFrame(build); }, 100);
      }
      const onResize = createViewportResizeHandler(scheduleBuild);
      // The fill image lives in an explicit aspect-ratio box. Its load does
      // not change layout and must not remeasure every pin during scrolling.
      context = gsap.context(prepareWords, article);
      document.fonts.ready.then(() => { if (!disposed) scheduleBuild(); });
      document.fonts.addEventListener("loadingdone", scheduleBuild);
      window.addEventListener("resize", onResize);
      return () => {
        disposed = true;
        clearTimeout(timer);
        cancelAnimationFrame(frame);
        document.fonts.removeEventListener("loadingdone", scheduleBuild);
        window.removeEventListener("resize", onResize);
        reset();
        requestScrollRefresh();
      };
    });
    return () => media.revert();
  });
  return null;
}
