"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const revealEase = "power2.out";

export function MotionController() {
  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add(
      {
        desktop: "(min-width: 1024px)",
        mobile: "(max-width: 1023px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        if (context.conditions?.reduceMotion) return;

        // Pause only the existing closing atmosphere offscreen on compact
        // layouts. Its appearance/speed and every desktop animation stay intact.
        let disposeClosing = () => {};
        const closing = context.conditions?.mobile ? document.getElementById("closing") : null;
        if (closing) {
          const original = closing.style.getPropertyValue("--closing-play-state");
          let visible = false, applied = "";
          const syncClosing = () => {
            const state = visible && !document.hidden ? "running" : "paused";
            if (state !== applied) closing.style.setProperty("--closing-play-state", applied = state);
          };
          const closingObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            syncClosing();
          }, { rootMargin: "100px 0px" });
          syncClosing();
          closingObserver.observe(closing);
          document.addEventListener("visibilitychange", syncClosing);
          disposeClosing = () => {
            closingObserver.disconnect();
            document.removeEventListener("visibilitychange", syncClosing);
            if (original) closing.style.setProperty("--closing-play-state", original);
            else closing.style.removeProperty("--closing-play-state");
          };
        }

        // These entrances only change ink/transforms, never document geometry.
        // Keep all pins early; prepare offscreen decoration one viewport ahead.
        const pending = new Map<Element, (() => void)[]>();
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            pending.get(entry.target)?.forEach((prepare) => context.add(prepare));
            pending.delete(entry.target);
          });
        }, { rootMargin: `${innerHeight}px 0px` });
        function prepareNearViewport(target: Element, prepare: () => void) {
          pending.set(target, [...(pending.get(target) ?? []), prepare]);
          observer.observe(target);
        }

        const distance = context.conditions?.desktop ? 32 : 20;
        const hero = document.getElementById("hero");
        const heroStage = hero?.querySelector<HTMLElement>("[data-hero-parallax-stage]");
        if (hero && heroStage) {
          const foregroundSpeed = .22;
          const maximumOffset = 160;
          const scrollDistance = () => Math.min(heroStage.clientHeight, maximumOffset / foregroundSpeed);
          const offset = () => scrollDistance() * foregroundSpeed;
          const foreground = gsap.utils.toArray<HTMLElement>("[data-hero-foreground]");
          const portrait = hero.querySelector<HTMLElement>("[data-hero-portrait]");
          const overlapEdge = document.querySelector<HTMLElement>("[data-hero-overlap-edge]");
          // Animate only the five moving layers. Updating an inherited variable
          // on <html> invalidated styles throughout the page every frame; the
          // overlap's changing height also caused layout. Direct transforms keep
          // the same distances and smoothing without either source of work.
          const layers = [...foreground, ...(portrait ? [portrait] : []), ...(overlapEdge ? [overlapEdge] : [])];
          gsap.set(layers, { willChange: "transform" });
          const parallax = gsap.timeline({
            defaults: { ease: "none", duration: 1, force3D: true },
            scrollTrigger: {
              id: "hero-parallax", trigger: hero,
              start: "top top", end: () => `+=${scrollDistance()}`,
              scrub: .22, invalidateOnRefresh: true,
            },
          });
          parallax.fromTo(foreground, { y: 0 }, { y: () => -offset() }, 0);
          if (portrait) parallax.fromTo(portrait, { y: 0 }, { y: () => offset() * .8 }, 0);
          if (overlapEdge) parallax.fromTo(overlapEdge, { scaleY: 0 }, { scaleY: () => offset() / maximumOffset }, 0);
        }
        gsap.utils.toArray<HTMLElement>("[data-motion-heading]").forEach((heading) => {
          prepareNearViewport(heading, () => {
            if (heading.dataset.headingReveal === "journey") {
              // This heading replaces the default entrance with a reversible
              // ink-only reveal; its centered layout never moves.
              gsap.fromTo(heading, { color: "#777777", filter: "blur(5px)" }, {
                color: "#FFFFFF", filter: "blur(0px)", ease: "none",
                scrollTrigger: {
                  id: "life-journey-heading-reveal", trigger: heading,
                  start: "top 95%", end: "top 68%", scrub: true,
                  invalidateOnRefresh: true,
                },
              });
              return;
            }
            if (heading.dataset.headingReveal === "blur") {
              const cards = heading.closest("section")?.querySelectorAll<HTMLElement>("[data-technology-card]");
              gsap.fromTo(heading, {
                autoAlpha: 0, color: "#777777", filter: "blur(15px)", y: 30,
              }, {
                autoAlpha: 1, color: "#FFFFFF", filter: "blur(0px)", y: 0,
                ease: "none",
                scrollTrigger: {
                  // The container starts at the heading's natural top and does not
                  // inherit its 30px entrance transform when triggers refresh.
                  id: "technology-heading-reveal", trigger: heading.parentElement ?? heading,
                  start: "top 98%", end: "top 78%", scrub: true,
                  invalidateOnRefresh: true,
                },
              });
              if (cards?.length) {
                // Preserve the cards' original scroll range and smoothing independently.
                // Scale the outer grid items; the inner card owns its click rotation.
                gsap.fromTo(cards, { scale: .85 }, {
                  scale: 1, duration: 1.2, ease: "none",
                  scrollTrigger: {
                    trigger: heading, start: "top 88%", end: "top 20%",
                    scrub: 1.2, invalidateOnRefresh: true,
                  },
                });
              }
              return;
            }
            gsap.from(heading, {
              autoAlpha: 0,
              duration: 0.7,
              ease: revealEase,
              scrollTrigger: {
                once: true,
                start: "top 82%",
                trigger: heading,
              },
              y: distance,
            });
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-motion-visual]").forEach((visual) => {
          prepareNearViewport(visual, () => {
            gsap.from(visual, {
              autoAlpha: 0,
              clipPath: "inset(8% 0 0 0)",
              duration: 0.85,
              ease: revealEase,
              scrollTrigger: {
                once: true,
                start: "top 84%",
                trigger: visual,
              },
              y: distance,
            });
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-motion-group]").forEach((group) => {
          const items = group.querySelectorAll<HTMLElement>("[data-motion-item]");
          if (!items.length) return;
          prepareNearViewport(group, () => {
            gsap.from(items, {
              autoAlpha: 0,
              duration: 0.55,
              ease: revealEase,
              stagger: context.conditions?.desktop ? 0.1 : 0.06,
              scrollTrigger: {
                once: true,
                start: "top 84%",
                trigger: group,
              },
              y: distance,
            });
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-motion-line]").forEach((line) => {
          prepareNearViewport(line, () => {
            gsap.from(line, {
              duration: 0.8,
              ease: "power1.inOut",
              scaleX: 0,
              scrollTrigger: {
                once: true,
                start: "top 86%",
                trigger: line,
              },
              transformOrigin: "left center",
            });
          });
        });

        if (context.conditions?.desktop) {
          gsap.utils.toArray<HTMLElement>("[data-motion-parallax]").forEach((visual) => {
            prepareNearViewport(visual, () => {
              gsap.to(visual, {
                ease: "none",
                scrollTrigger: {
                  end: "bottom top",
                  scrub: 0.6,
                  start: "top bottom",
                  trigger: visual,
                },
                yPercent: 3,
              });
            });
          });
        }
        return () => { disposeClosing(); observer.disconnect(); pending.clear(); };
      },
    );

    return () => media.revert();
  });

  return null;
}
