"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const motionQuery = "(min-width: 1024px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)";

export function JourneySequence() {
  useGSAP(() => {
    const scene = document.querySelector<HTMLElement>("#journey [data-journey-scene]");
    const title = scene?.querySelector<HTMLElement>("[data-journey-title]");
    if (!scene || !title) return;
    const cards = Array.from(scene.querySelectorAll<HTMLElement>("[data-journey-card]"));
    const elements = [title, ...cards];
    const originalStyles = elements.map((element) => element.getAttribute("style"));
    const media = gsap.matchMedia();

    media.add(motionQuery, () => {
      let context: gsap.Context | undefined;
      let disposed = false;
      let timer: ReturnType<typeof setTimeout> | undefined;

      function reset() {
        context?.revert();
        context = undefined;
        // Restore after reversion, including values captured by gsap.set.
        elements.forEach((element, index) => {
          const style = originalStyles[index];
          if (style === null) element.removeAttribute("style");
          else element.setAttribute("style", style);
        });
      }

      function build() {
        if (disposed || !scene!.isConnected) return;
        reset();
        const top = scene!.getBoundingClientRect().top;
        const header = parseFloat(getComputedStyle(document.documentElement).fontSize) * 4.5;
        const distance = scene!.offsetHeight - window.innerHeight + header;
        if (distance <= 0) return;
        // Read layout once per build, never on every scroll update.
        const reveals = cards.map((card) => {
          const cardTop = card.getBoundingClientRect().top - top;
          const start = gsap.utils.clamp(0, 0.92, (cardTop - window.innerHeight * 0.9 + header) / distance);
          const end = gsap.utils.clamp(start + 0.01, 1, (cardTop - window.innerHeight * 0.58 + header) / distance);
          return { start, duration: end - start };
        });
        context = gsap.context(() => {
          const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });
          gsap.set(cards, { opacity: 0, y: 48 });
          timeline.to(title!, { scale: 0.58, filter: "blur(8px)", opacity: 0.45, duration: 1 }, 0);
          cards.forEach((card, index) => {
            timeline.to(card, { opacity: 1, y: 0, duration: reveals[index].duration }, reveals[index].start);
          });
          const trigger = ScrollTrigger.create({
            id: "journey-character-sequence",
            trigger: scene,
            start: `top ${header}px`,
            end: "bottom bottom",
            scrub: true,
            animation: timeline,
          });
          trigger.refresh();
          trigger.update();
          timeline.totalProgress(trigger.progress, true);
        }, scene!);
      }

      function scheduleBuild() {
        clearTimeout(timer);
        timer = setTimeout(build, 150);
      }
      document.fonts.ready.then(() => { if (!disposed) build(); });
      document.fonts.addEventListener("loadingdone", scheduleBuild);
      window.addEventListener("resize", scheduleBuild);
      return () => {
        disposed = true;
        clearTimeout(timer);
        window.removeEventListener("resize", scheduleBuild);
        document.fonts.removeEventListener("loadingdone", scheduleBuild);
        reset();
      };
    });

    return () => media.revert();
  });

  return null;
}
