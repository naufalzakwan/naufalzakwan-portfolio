"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ProjectTextReveal() {
  useGSAP(() => {
    const content = document.querySelector<HTMLElement>("[data-egggym-content]");
    if (!content) return;
    const texts = [...content.querySelectorAll<HTMLElement>("[data-egggym-reveal]")];
    const colors = texts.map(text => getComputedStyle(text).color);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(texts, { color: "#777777", filter: "blur(6px)" });
      const timeline = gsap.timeline({
        defaults: { ease: "none", duration: 1 },
        scrollTrigger: {
          id: "egggym-text-reveal", trigger: content,
          start: "top 95%", end: "top 60%",
          scrub: true, invalidateOnRefresh: true,
        },
      });
      // Read in order while retaining each element's original final color.
      texts.forEach((text, index) => {
        timeline.to(text, { color: colors[index], filter: "blur(0px)" });
      });
    });
    return () => media.revert();
  }, []);
  return null;
}
