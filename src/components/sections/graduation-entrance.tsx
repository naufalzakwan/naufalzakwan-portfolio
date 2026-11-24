"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function GraduationEntrance() {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>("#contact [data-graduation]");
    if (!root) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      let context: gsap.Context | undefined;
      let disposed = false;
      document.fonts.ready.then(() => {
        if (disposed) return;
        context = gsap.context(() => {
          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              id: "graduation-entrance", trigger: root, start: "top 88%",
              refreshPriority: -3, once: true,
            },
          }).fromTo(root.querySelector("[data-graduation-photo]"),
            { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .85 }, 0)
            .fromTo(root.querySelectorAll("[data-graduation-copy]"),
              { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .75, stagger: .1 }, .12);
        }, root);
        requestScrollRefresh();
      });
      return () => { disposed = true; context?.revert(); };
    });
    return () => media.revert();
  }, []);
  return null;
}
