"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh";
import { createViewportResizeHandler } from "@/lib/viewport-resize";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MusicSequence() {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>("[data-music-sequence]");
    const viewport = root?.querySelector<HTMLElement>("[data-music-viewport]");
    if (!root || !viewport) return;
    const hero = root.parentElement?.querySelector<HTMLElement>("[data-music-hero]");
    const previousPhotoOffset = hero?.style.getPropertyValue("--music-photo-edge-offset");
    // Measure the usable viewport edge, including container/max-width gutters
    // but excluding the browser scrollbar. This affects only the photo column.
    function alignPhoto() {
      if (!hero) return;
      const offset = Math.max(0, document.documentElement.clientWidth - hero.getBoundingClientRect().right);
      hero.style.setProperty("--music-photo-edge-offset", `${offset}px`);
    }
    const photoResize = new ResizeObserver(alignPhoto);
    if (hero) photoResize.observe(hero);
    window.addEventListener("resize", alignPhoto);
    alignPhoto();
    const banners = Array.from(root.querySelectorAll<HTMLElement>("[data-music-banner]"));
    const elements = [viewport, ...banners];
    const originals = elements.map((element) => element.getAttribute("style"));
    const media = gsap.matchMedia();
    const heading = hero?.querySelector<HTMLElement>("h2");
    const emphasis = heading?.querySelector<HTMLElement>("strong");
    const introduction = hero?.querySelector<HTMLElement>("p");
    if (hero && heading && emphasis && introduction) {
      const headingColor = getComputedStyle(heading).color;
      const emphasisColor = getComputedStyle(emphasis).color;
      const introductionColor = getComputedStyle(introduction).color;
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set([heading, emphasis, introduction], { color: "#777777" });
        gsap.set([heading, introduction], { filter: "blur(6px)" });
        const reveal = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "music-introduction-reveal", trigger: hero,
            start: "top 95%",
            end: () => {
              // On tall stacked layouts, use the available viewport as the
              // visibility limit rather than waiting for an impossible full fit.
              const visibleHeight = Math.min(hero.offsetHeight, innerHeight);
              return `top ${innerHeight - visibleHeight * .78}px`;
            },
            scrub: true, invalidateOnRefresh: true,
          },
        });
        reveal.to([heading, introduction], {
          color: (index: number) => index === 0 ? headingColor : introductionColor,
          filter: "blur(0px)", duration: 1,
        }, 0)
          .to(emphasis, { color: emphasisColor, duration: 1 }, 0);
      });
    }
    media.add("(min-height: 320px) and (prefers-reduced-motion: no-preference)", () => {
      let context: gsap.Context | undefined;
      let disposed = false;
      let timer: ReturnType<typeof setTimeout>;
      let frame = 0;
      function reset() {
        context?.revert(); context = undefined;
        delete viewport!.dataset.musicLayout;
        elements.forEach((element, index) => {
          const style = originals[index];
          if (style === null) element.removeAttribute("style"); else element.setAttribute("style", style);
        });
      }
      function build() {
        if (disposed || !viewport!.isConnected) return;
        reset();
        const header = parseFloat(getComputedStyle(document.documentElement).fontSize) * 4.5;
        const height = innerHeight - header;
        viewport!.style.setProperty("--music-height", `${height}px`);
        viewport!.dataset.musicLayout = "measuring";
        const insets = banners.map((banner) => getComputedStyle(banner).insetInlineStart);
        // Check every poster at the narrowest animated width before pinning.
        // Batch these measurements during setup, never inside scroll updates.
        banners.forEach((banner) => banner.style.setProperty("--music-card-inset", insets[2]));
        const fits = banners.every((banner) => {
          const area = banner.getBoundingClientRect();
          const content = banner.querySelector<HTMLElement>("[data-music-content]");
          if (!content) return true;
          return content.scrollHeight <= content.clientHeight + 1 && Array.from(banner.querySelectorAll<HTMLElement>("[data-music-caption]")).every((element) => {
            const rect = element.getBoundingClientRect();
            return rect.top >= area.top && rect.bottom <= area.bottom && rect.left >= area.left && rect.right <= area.right;
          });
        });
        if (!fits) { reset(); requestScrollRefresh(); return; }
        banners.forEach((banner, index) => banner.style.setProperty("--music-card-inset", insets[index]));
        // Poster 01 stays in its normal slot while the viewport approaches.
        // Only posters 02/03 start below the clip for the layered transitions.
        const slideDuration = .28;
        const slideStarts = [.08, .44];
        const shrinkDuration = .08;
        const closingDuration = .08;
        const closingEnd = slideStarts[1] + slideDuration;
        const closingStart = closingEnd - closingDuration;
        const stack = banners[2].parentElement!;
        const viewportTop = viewport!.getBoundingClientRect().top;
        const visibleHeight = Math.min(viewport!.clientHeight, innerHeight - header);
        const restingTops = banners.slice(1).map((banner) => banner.getBoundingClientRect().top - viewportTop);
        const entryGap = parseFloat(getComputedStyle(stack).rowGap);
        // Each incoming poster starts just below the clip, not a full viewport
        // below its own resting position. Keep the existing stack spacing.
        const travels = restingTops.map((top) => Math.max(entryGap, visibleHeight - top + entryGap));
        // With linear vertical travel, this is when the incoming top first
        // crosses the visible bottom of the pinned viewport. Finish shrinking
        // one pixel before entry to allow for pin/subpixel rounding.
        const entryTimes = restingTops.map((restingTop, index) => {
          const travel = travels[index];
          const hiddenFraction = Math.max(0, Math.min(1, (restingTop + travel - visibleHeight - 1) / travel));
          return slideStarts[index] + slideDuration * hiddenFraction;
        });
        try {
          context = gsap.context(() => {
            const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });
            // One horizontal source of truth for every layer. CSS keeps future
            // cards at their narrower target until this shared inset catches up.
            gsap.set(viewport!, { "--music-active-inset": insets[0] });
            gsap.set(banners.slice(1), { y: (index: number) => travels[index] });
            timeline.to(banners[1], { y: 0, duration: slideDuration }, slideStarts[0])
              .to(viewport!, { "--music-active-inset": insets[1], duration: shrinkDuration }, entryTimes[0] - shrinkDuration)
              .to(banners[2], { y: 0, duration: slideDuration }, slideStarts[1])
              .to(viewport!, { "--music-active-inset": insets[2], duration: shrinkDuration }, entryTimes[1] - shrinkDuration)
              // Close the exposed strips by the time poster 03 finishes rising.
              // Raise the last panel without stretching its shared card height.
              .to(banners[2], { top: 0, duration: closingDuration }, closingStart)
              .to(banners.slice(0, 2), { autoAlpha: 0, duration: closingDuration }, closingStart)
              .to({}, { duration: .06 }, closingEnd);
            viewport!.dataset.musicLayout = "active";
            const trigger = ScrollTrigger.create({ id: "music-banner-sequence", trigger: viewport, pin: viewport,
              start: `top ${header}px`, end: `+=${Math.round(height * 1.9)}`, animation: timeline, scrub: .2, anticipatePin: 1 });
            trigger.refresh(); trigger.update(); timeline.totalProgress(trigger.progress, true);
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
    return () => {
      media.revert();
      photoResize.disconnect();
      window.removeEventListener("resize", alignPhoto);
      if (previousPhotoOffset) hero?.style.setProperty("--music-photo-edge-offset", previousPhotoOffset);
      else hero?.style.removeProperty("--music-photo-edge-offset");
    };
  });
  return null;
}
